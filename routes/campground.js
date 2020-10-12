var express= require("express");
var router= express.Router({mergeParams: true});
var Campground=require("../models/campground");



router.get("/",function(req,res){
    //get all campgrounds from database
    Campground.find({},function(err,allCampgrounds)
    {
        if(err)
        console.log(err);
        else
        res.render("campgrounds/index",{campgrounds:allCampgrounds,currentUser:req.user});
    })
});


//create route
router.post("/",isLoggedIn,function(req,res){
var name=req.body.name;
var image=req.body.image;
var desc=req.body.description;
var price=req.body.price;
var author={
    id:req.user._id,
    username: req.user.username
}
var newcampground={name: name,price:price,image: image,description:desc,author:author};
//create a new campground and save to database


Campground.create(newcampground,function(err,newlycreated){
    if(err){
    console.log(err);
    }
    else{
        res.redirect("/campgrounds");
    }
});
});


//new route
router.get("/new",isLoggedIn,function(req,res){
res.render("campgrounds/new");
});

//show route
router.get("/:id",function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err)
        console.log(err);
        else{
            console.log(foundCampground);
        res.render("campgrounds/show",{campground:foundCampground});
        }
    });
});
// show edit form
router.get("/:id/edit",checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,foundCamp){
        if(err)
        res.redirect("/campgrounds");
        else{
            res.render("campgrounds/edit",{campground:foundCamp});
        }
    });
    
});
//edit 
router.put("/:id",checkCampgroundOwnership,function(req,res){
    //find and update correct campground
    Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,upadtedCamp){
       if(err)
       console.log("/campgrounds") ;
       else
       res.redirect("/campgrounds/"+upadtedCamp.id);
    });
    //redirect
});
// destroy campground
router.delete("/:id",checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err)
        res.redirect("/campgrounds");
        else
        res.redirect("/campgrounds");
    })
});


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be Logged In to do that!");
    res.redirect("/login");
}

function checkCampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){//if user is logged in
        Campground.findById(req.params.id,function(err,foundCamp){
            if(err){
                res.redirect("back");
            }else{
             if(foundCamp.author.id.equals(req.user._id)){//if user has created campground
                 next();
             }else{
                req.flash("error","You don't have permission to do that!");
                 res.redirect("back");
             }
            }
        })
    }else{
        req.flash("error","You need to be Logged In to do that!");
        res.redirect("back");
    }
}

module.exports=router;