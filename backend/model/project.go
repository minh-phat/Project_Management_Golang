package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Project struct {
	Id          primitive.ObjectID   `json:"_id,omitempty" bson:"_id,omitempty"`
	Leader      primitive.ObjectID   `json:"leader,omitempty" bson:"leader,omitempty" validate:"required"`
	Customers   []primitive.ObjectID `bson:"customers,omitempty"`
	Title       string               `json:"title,omitempty" bson:"title,omitempty" validate:"required"`
	Description string               `json:"description,omitempty" bson:"description,omitempty"`
	CreatedAt   time.Time            `bson:"createdAt"`
	UpdatedAt   time.Time            `bson:"updatedAt"`
	EndDate     time.Time            `bson:"endDate"`
}

// [Project] ->> Epic ->> Task
