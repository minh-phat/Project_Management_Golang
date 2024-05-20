package controller

import (
	"backend/model"
	"context"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), timeoutLimit)
		defer cancel()

		// Create an instance of the Account model to store username and password
		var loginCredentials model.Account

		// Bind the username and password to the Account model
		bindingErr := c.BindJSON(&loginCredentials)
		if bindingErr != nil {
			c.JSON(http.StatusBadRequest, "Request binding error: "+bindingErr.Error())
			return
		}

		// Trim the received username and password
		loginCredentials.Username = strings.TrimSpace(loginCredentials.Username)
		loginCredentials.Password = strings.TrimSpace(loginCredentials.Password)

		// Find account by username and join with authorizations collection
		var account gin.H
		pipeline := mongo.Pipeline{
			bson.D{
				{Key: "$match", Value: bson.D{
					{Key: "username", Value: loginCredentials.Username},
				}},
			},
			bson.D{
				{Key: "$lookup", Value: bson.D{
					{Key: "from", Value: "authorizations"},
					{Key: "localField", Value: "account_authorization_id"},
					{Key: "foreignField", Value: "_id"},
					{Key: "as", Value: "levelName"},
				}},
			},
			bson.D{
				{Key: "$project", Value: bson.D{
					{Key: "username", Value: 1},
					{Key: "password", Value: 1},
					{Key: "account_name", Value: 1},
					{Key: "levelName", Value: bson.D{
						{Key: "$arrayElemAt", Value: bson.A{"$levelName.levelName", 0}},
					}},
				}},
			},
		}
		usernameQueryResult, usernameQueryErr := accountCollection.Aggregate(ctx, pipeline)
		if usernameQueryErr != nil {
			c.JSON(http.StatusInternalServerError, "Error querying username: "+usernameQueryErr.Error())
			return
		}
		if usernameQueryResult.Next(ctx) {
			decodeErr := usernameQueryResult.Decode(&account)
			if decodeErr != nil {
				c.JSON(http.StatusInternalServerError, "Error decoding username: "+decodeErr.Error())
				return
			}
		}

		// If username does not exist
		if account == nil {
			// Send response to the client
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "User account does not exist",
				"field":   "email",
				"success": false,
			})
		} else {
			// Compare entered password with hashed password in database
			comparePasswordSuccess := VerifyPassword(loginCredentials.Password, account["password"].(string))

			// If passwords match
			if comparePasswordSuccess {
				// Create token with user ID and level name in payload
				token := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{
					"account_id": account["_id"].(primitive.ObjectID).Hex(),
					"level":      account["levelName"].(string),
					"exp":        time.Now().Add(time.Hour * 24).Unix(),
				})

				// Create token with secret key
				signedToken, signingErr := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
				if signingErr != nil {
					c.JSON(http.StatusInternalServerError, "Error signing token: "+signingErr.Error())
					return
				}

				// Encrypt the token with encryption key
				var encryptedToken, encryptErr = Encrypt([]byte(signedToken), []byte(os.Getenv("ENCRYPTION_KEY")))
				if encryptErr != nil {
					c.JSON(http.StatusInternalServerError, "Error encrypting token: "+encryptErr.Error())
					return
				}

				// Encode the encrypted token to base64 and to URL safe format
				encodedBase64 := base64.StdEncoding.EncodeToString([]byte(encryptedToken))
				encodedToken := url.QueryEscape(encodedBase64)

				// Create an HTTP-only cookie
				cookie := &http.Cookie{
					Name:     "access_token",
					Value:    encodedToken,
					Expires:  time.Now().Add(24 * time.Hour), // Adjust the expiration time as needed
					HttpOnly: true,
					Secure:   false,                // Set to true to ensure the cookie is sent only over HTTPS
					SameSite: http.SameSiteLaxMode, // Set the SameSite attribute for CSRF protection
					Path:     "/",                  // Set the path attribute to restrict the cookie to a specific path
					Domain:   "localhost",          // Set the domain attribute to restrict the cookie to a specific domain
				}

				// Send the cookie to client
				http.SetCookie(c.Writer, cookie)

				// Send the response to client
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Login successful",
					"level":   account["levelName"].(string),
				})
				return
			} else {
				// Send response to the client for incrorrect username or password
				c.JSON(http.StatusUnauthorized, gin.H{
					"success": false,
					"message": "Incorrect password",
					"field":   "password",
				})
			}
		}
	}
}

func LogOut() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Create an HTTP-only cookie
		cookie := &http.Cookie{
			Name:     "access_token",
			Value:    "",
			Expires:  time.Now().Add(-time.Hour), // Adjust the expiration time as needed
			HttpOnly: true,
			Secure:   false,                   // Set to true to ensure the cookie is sent only over HTTPS
			SameSite: http.SameSiteStrictMode, // Set the SameSite attribute for CSRF protection
			Path:     "/",                     // Set the path attribute to restrict the cookie to a specific path
			Domain:   "",                      // Set the domain attribute to restrict the cookie to a specific domain
		}

		// Send the cookie to client
		http.SetCookie(c.Writer, cookie)

		// Send the response to client
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Logout successful",
		})
	}
}

func IsAuthorized() gin.HandlerFunc {
	return func(c *gin.Context) {
		currentAccount := c.MustGet("currentAccount").(gin.H)
		if currentAccount != nil && currentAccount["authorization"] != nil && currentAccount["authorization"].(string) != "" {
			c.JSON(http.StatusOK, gin.H{
				"success":     true,
				"message":     "Authorized",
				"currentUser": currentAccount,
			})
			return
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Unauthorized",
			})
			return
		}
	}
}

func ResetPassword() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), timeoutLimit)
		defer cancel()

		// Get id from link
		var accountString = c.Param("id")
		//convert to primary object for ID
		accountId, convertErr := primitive.ObjectIDFromHex(accountString)
		if convertErr != nil {
			c.JSON(http.StatusBadRequest, "Error converting account ID: "+convertErr.Error())
			return
		}

		var account gin.H
		pipeline := mongo.Pipeline{
			bson.D{
				{Key: "$match", Value: bson.D{
					{Key: "account_id", Value: accountId},
				}},
			},
			bson.D{
				{Key: "$lookup", Value: bson.D{
					{Key: "from", Value: "user_infor"},
					{Key: "localField", Value: "userinfor_id"},
					{Key: "foreignField", Value: "_id"},
					{Key: "as", Value: "userinfor"},
				}},
			},
			bson.D{
				{Key: "$project", Value: bson.D{
					{Key: "fullname", Value: bson.D{
						{Key: "$arrayElemAt", Value: bson.A{"$userinfor.fullname", 0}},
					}},
					{Key: "email", Value: bson.D{
						{Key: "$arrayElemAt", Value: bson.A{"$userinfor.email", 0}},
					}},
				}},
			},
		}
		accountQueryResult, aggregateErr := employeeCollection.Aggregate(ctx, pipeline)
		if aggregateErr != nil {
			fmt.Print(aggregateErr.Error())
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Unauthorized",
			})
			c.Abort()
			return
		}
		if accountQueryResult.Next(ctx) {
			decodeErr := accountQueryResult.Decode(&account)
			if decodeErr != nil {
				c.JSON(http.StatusUnauthorized, gin.H{
					"success": false,
					"message": "Unauthorized",
				})
				c.Abort()
				return
			}
		}

		var password, unhashedPassword = GenerateAndHashPassword()
		if password == "" {
			c.JSON(http.StatusInternalServerError, "Error generating password")
			return
		}

		accountCollection.FindOneAndUpdate(
			ctx,
			bson.D{{Key: "_id", Value: accountId}},
			bson.D{
				{Key: "$set", Value: bson.D{
					{Key: "password", Value: password},
					{Key: "updatedAt", Value: time.Now().Unix()},
				}},
			},
		)

		sendEmailSuccess := SendEmailResetPassword(account["email"].(string), account["fullname"].(string), unhashedPassword)
		if !sendEmailSuccess {
			c.JSON(http.StatusInternalServerError, "Error sending emails")
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Account password reset",
		})
	}
}

func ChangePassword() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), timeoutLimit)
		defer cancel()

		// Get id from link
		var accountString = c.Param("id")
		// Convert to primary object for ID
		accountId, convertErr := primitive.ObjectIDFromHex(accountString)
		if convertErr != nil {
			c.JSON(http.StatusBadRequest, "Error converting account ID: "+convertErr.Error())
			return
		}

		var account model.Account

		accountQueryErr := accountCollection.FindOne(ctx, bson.M{"_id": accountId}).Decode(&account)
		if accountQueryErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid account Id",
			})
			return
		}

		var dataMap = make(map[string]interface{})
		var jsonData map[string]interface{}
		// Read all data from request
		requestBody, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, "Failed to read request body")
			return
		}
		// Unmarshal JSON data
		if err := json.Unmarshal(requestBody, &jsonData); err != nil {
			c.JSON(http.StatusBadRequest, "Failed to parse JSON")
			return
		}
		// Append data to map
		for key, value := range jsonData {
			dataMap[key] = value
		}

		var oldPW = dataMap["old_password"].(string)
		var newPW = dataMap["new_password"].(string)
		var renewPW = dataMap["renew_password"].(string)
		var hashedPasswordHex string
		var updatePasswordResult *mongo.SingleResult

		if (oldPW != "" && newPW != "" && renewPW != "") && (newPW == renewPW) {
			// Check if the old password is correct
			if VerifyPassword(oldPW, account.Password) {
				if CheckPassword(newPW) {
					combined := os.Getenv("PEPPER1") + newPW + os.Getenv("PEPPER2")

					// Hash the generated password
					hashedPassword, errhashedPassword := bcrypt.GenerateFromPassword([]byte(combined), 15)
					if errhashedPassword != nil {
						c.JSON(http.StatusInternalServerError, "Failed to hash password")
						return
					}

					hashedPasswordHex = hex.EncodeToString(hashedPassword)

					updatePasswordResult = accountCollection.FindOneAndUpdate(
						ctx,
						bson.D{{Key: "_id", Value: accountId}},
						bson.D{
							{Key: "$set", Value: bson.D{
								{Key: "password", Value: hashedPasswordHex},
								{Key: "updatedAt", Value: time.Now().Unix()},
							}},
						},
					)
				} else {
					c.JSON(http.StatusBadRequest, gin.H{
						"success": false,
						"message": "*New password does not meet requirements",
					})
					return
				}
			} else {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "*Incorrect password",
				})
				return
			}
		}

		if updatePasswordResult.Err() != nil {
			c.JSON(http.StatusInternalServerError, "Failed to update password")
			return
		} else {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Password updated",
			})
		}
	}
}
