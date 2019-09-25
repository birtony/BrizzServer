# Brizz Server

## Data Model Structure
![Data Model Structure](https://github.com/birtony/BrizzServer/blob/master/Assets/DataModel.png)

## Available Methods
### User Methods:

Methods | URL | Type
:------- | :--- | :----:
Get All Users | `/api/users` | Get
Get a User by ID | `/api/users/:userId` | Get
Get a User by Username | `/api/users/username/:username"` | Get
Activate User | `/api/users/activate` | Post
Create User | `/api/users/create` | Post
Login User | `/api/users/login` | Post
Update User | `/api/users/:username/update` | Post

### Program Methods:
Methods | URL | Type
:------- | :--- | :----:
Get All Programs | `/api/programs` | Get
Get a Program by Id | `/api/programs/:programId` | Get
