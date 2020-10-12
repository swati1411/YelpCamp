var express= require("express");
var router= express.Router({mergeParams: true});
var Campground=require("../models/campground");
var Comment=require("../models/comment");

//commets new
router.get("/new",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err)
        console.log(err);
        else{
            res.render("comments/new",{campground:campground});
        }
    });
});
//cooments create
router.post("/",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
        console.log(err);
        res.redirect("/campgrounds");
        }else{
        Comment.create(req.body.comment,function(err,comment){
           if(err)
           console.log(err);
           else{
               //add username and id to comment
               comment.author.id= req.user._id;
               comment.author.username=req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success","Successfully added comment");
               res.redirect('/campgrounds/'+campground._id);
           } 
        });
        }
    });
});

//edit comment
router.get("/:comment_id/edit",checkCommentsOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err,comment){
        if(err)
        console.log(err);
        else{
        res.render("comments/edit",{comment:comment,campground_id:req.params.id});
        }
    });   
});

//post edit comment
router.put("/:comment_id",checkCommentsOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
            if(err){
                req.redirect("back");
            }
            else{
                req.flash("success","Comment Edited Successfully");
            res.redirect('/campgrounds/'+req.params.id);
            }
    });
});

//comment delete
router.delete("/:comment_id",checkCommentsOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err)
        res.redirect("back");
        else{
            req.flash("sucess","Comment Deleted");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be Logged In to do that!");
    res.redirect("/login");
}

function checkCommentsOwnership(req,res,next){
    if(req.isAuthenticated()){//if user is logged in
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err){
                res.redirect("back");
            }else{
             if(foundComment.author.id.equals(req.user._id)){//if user has created campground
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