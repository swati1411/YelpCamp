var    express       =require("express"),
       app           =express(),
       flash         =require("connect-flash"),
       bodyParser    =require("body-parser");
const  mongoose      =require("mongoose");
var    Campground    =require("./models/campground"),
       seedDb        =require("./seed"),
       Comment       =require("./models/comment"),
       passport      =require("passport"),
       localStrategy =require("passport-local"),
       User          =require("./models/user"),
       methodOverride=require("method-override");
//require routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes =require("./routes/campground"),
    authRoutes       =require("./routes/index");       



mongoose.connect('mongodb+srv://yelpcamp:swati1293%23@cluster0.ikxyc.mongodb.net/yelpcamp?retryWrites=true&w=majority', {
useNewUrlParser: true,
useUnifiedTopology: true
})

.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
//seedDb();


//passport configuration
app.use(flash());
app.use(require("express-session")({
    secret:"Swati is the best",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
});

app.use("/",authRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes);

var port_number = server.listen(process.env.PORT || 3000);
app.listen(port_number);