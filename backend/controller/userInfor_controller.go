package controller

import (
	"backend/model"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UserInforGetAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		var userInfor []model.UserInfor

		defer cancel()

		//find all userInfor
		results, errCollection := userInforCollection.Find(ctx, bson.M{})

		if errCollection != nil {
			c.JSON(http.StatusInternalServerError, errCollection.Error())
			return
		}

		//reading from the db more optimally
		defer results.Close(ctx)

		//loop through the results
		for results.Next(ctx) {

			var singleUserInfor model.UserInfor

			if err := results.Decode(&singleUserInfor); err != nil {
				c.JSON(http.StatusInternalServerError, err.Error())
			}
			userInfor = append(userInfor, singleUserInfor)
		}
		c.JSON(http.StatusOK, userInfor)

	}
}

func UpdateUserInfor1() gin.HandlerFunc {
	return func(c *gin.Context) {

		//must have to connect database
		ctx, cancel := context.WithTimeout(context.Background(), timeoutLimit)
		defer cancel()

		var user_infor model.UserInfor

		//get id from link
		var GetUserInforID = c.Param("id")
		//convert to primary object for ID
		id, _ := primitive.ObjectIDFromHex(GetUserInforID)

		//Create struct type to save data with model
		var getUserInforUpdate model.UserInfor

		//Get Data from frontend
		jsonData := c.Request.FormValue("userInforData")
		errUnmarShal := json.Unmarshal([]byte(jsonData), &getUserInforUpdate)
		if errUnmarShal != nil {
			c.JSON(http.StatusBadRequest, "Request error"+errUnmarShal.Error())
			return
		}

		//Check if file that get from frontend  is null

		fmt.Println("Get Fullname to update:", getUserInforUpdate.FullName)
		fmt.Println("Get Office to update:", getUserInforUpdate.Office)

		// Manager_ID_Convert, _ := primitive.ObjectIDFromHex(getUserInforUpdate.Manager_ID.Hex())
		filter := bson.D{{Key: "_id", Value: id}}
		update := bson.D{{Key: "$set", Value: bson.D{
			{Key: "fullname", Value: getUserInforUpdate.FullName},
			{Key: "office", Value: getUserInforUpdate.Office},
			{Key: "department", Value: getUserInforUpdate.Department},
			{Key: "position", Value: getUserInforUpdate.Position},
			{Key: "email", Value: getUserInforUpdate.Email},
			{Key: "phone", Value: getUserInforUpdate.Phone},
			{Key: "gender", Value: getUserInforUpdate.Gender},
			{Key: "address", Value: getUserInforUpdate.Address},
			{Key: "manager_id", Value: getUserInforUpdate.Manager_ID},
			{Key: "createdAt", Value: time.Now().Unix()},
		}}} // "password", "asdfadfafs",

		if err1 := userInforCollection.FindOneAndUpdate(ctx, filter, update).Decode(&user_infor); err1 != nil {
			c.JSON(http.StatusInternalServerError, "Error updating project"+err1.Error())
			return
		} else {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Updated account successfully",
			})
		}
	}
}

func UpdateUserInfor() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), timeoutLimit)
		defer cancel()
		validate := validator.New()

		// Register the custom required validation function
		_ = validate.RegisterValidation("customrequired", CheckCustomRequired)

		// Create an array of the Task model
		var user_infor model.UserInfor

		//get id from link
		var GetUserInforID = c.Param("id")
		//convert to primary object for ID
		id, _ := primitive.ObjectIDFromHex(GetUserInforID)

		// Bind the request body to the task model
		bindingErr := c.BindJSON(&user_infor)
		if bindingErr != nil {
			c.JSON(http.StatusBadRequest, "Request binding error: "+bindingErr.Error())
			return
		}

		filter := bson.D{{Key: "_id", Value: id}}
		var update bson.D
		if user_infor.Profile_Image == "" {
			update = bson.D{{Key: "$set", Value: bson.D{
				{Key: "fullname", Value: user_infor.FullName},
				{Key: "email", Value: user_infor.Email},
				{Key: "phone", Value: user_infor.Phone},
				{Key: "gender", Value: user_infor.Gender},
				{Key: "address", Value: user_infor.Address},
				{Key: "updatedAt", Value: time.Now().Unix()},
			}}}
		} else {
			update = bson.D{{Key: "$set", Value: bson.D{
				{Key: "fullname", Value: user_infor.FullName},
				{Key: "email", Value: user_infor.Email},
				{Key: "phone", Value: user_infor.Phone},
				{Key: "gender", Value: user_infor.Gender},
				{Key: "address", Value: user_infor.Address},
				{Key: "profile_image", Value: user_infor.Profile_Image},
				{Key: "updatedAt", Value: time.Now().Unix()},
			}}}
		}

		if err1 := userInforCollection.FindOneAndUpdate(ctx, filter, update).Decode(&user_infor); err1 != nil {
			c.JSON(http.StatusInternalServerError, "Error updating project"+err1.Error())
			return
		} else {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Account updated",
			})
		}
	}
}
