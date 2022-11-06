const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const Users = require('../models/users')

// image upload

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + file.originalname)
    }
})
var upload = multer({
    storage: storage,
}).single('image');

// Insert an user into database route

router.post('/add', upload, (req, res) => {
    const user = new Users({
        "Full Name": req.body['Full Name'],
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    })
    user.save((err) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' })
        } else {
            req.session.message = {
                type: 'success',
                message: 'User added successfully'
            };
            res.redirect('/')
        }
    })
})
// get all users
router.get('/', (req, res) => {
    Users.find().exec((err,Users)=>{
        if(err){
            res.json({message:err.message})
        }else{
            res.render('index',{
                title:'Home Page',
                Users:Users
            })
        }
    })
})

router.get('/add', (req, res) => {
    res.render("add_users", { title: 'Add Users' })
})

/// edit user

router.get('/edit/:id',(req,res)=>{
    let id = req.params.id;
    Users.findById(id,(err,user)=>{
        if(err){
            res.redirect('/')
        }else{
            if(user == null){
                res.redirect('/')
            }else{
                res.render('edit_user',{
                    title:"Edit User",
                    user:user
                })
            }
        }
    })
})

// update user route

router.post('/update/:id',upload,(req,res)=>{
    let id = req.params.id;
    let new_image = "";
    if(req.file){
        new_image = req.file.filename
        try{
            fs.unlinkSync("./uploads/" + req.body.old_image)
        }catch(err){
            console.log(err)
        }
    }else{
        new_image=req.body.old_image
    }

    Users.findByIdAndUpdate(id,{
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        image:new_image
    },(err,result)=>{
        if(err){
            res.json({message:err.message,type:'danger'})
        }else{
            req.session.message={
                type:'success',
                message:"User Updated Seccessfully"
            }
            res.redirect("/")
        }
    })
})

// delete user
router.get('/delete/:id',(req,res)=>{
    let id = req.params.id;
    User.findByIdAndRemove(id,(err,result)=>{
        if(result.image !=''){
            try{
                fs.unlinkSync('./uploads/'+result.image)
            }catch(err){
                console.log(err)
            }
        }
        if(err){
            res.json({message:err.message})
        }else{
            req.session.message={
                type:'success',
                message:'User deleted successfully'
            }
            res.redirect("/")
        }
    })
})
module.exports = router;