var express = require("express");
var router = express.Router();
var db = require("../models");
var passport = require('passport');
var geocoder = require('geocoder');
var script = {
    login: '<script src="javascript/login.js" type="text/javascript"></script>',
    owner: '<script src="javascript/owner.js" type="text/javascript"></script><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>',
    renter: '<script src="javascript/renter.js" type="text/javascript"></script><script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAkjQIFfTlx7SAlf71jK9wgvWj6-Urkamc&callback=initMap"></script><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>',
    about: '<script src="javascript/about.js" type="text/javascript"></script>'
};

// ROUTES

router.post('/register', function(req, res) {
    db.Users.register(req.body.email.toLowerCase(), req.body.password, function(err, user) {
        if (err) {
            return res.json(err);
        }
        res.redirect('/login');
    });
});

router.post('/login', passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        // res.json(req.user);
        console.log('loggedin');
        res.redirect('/renter');
    });

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/login');
    });
});

router.post("/newuser", function(req, res) {
    console.log(req.body);
    db.users.create({
        email: req.body.email,
        password: req.body.password
    });
});

router.post("/login", function(req, res) {
    console.log('success');
});

router.get("/login", function(req, res) {
    if (req.user !== undefined) {
        res.redirect('/renter');
    } else {
        res.render('login.handlebars', {
            title: 'TMS | Login',
            scripts: script.login
        });
    }
});

// router.post('/renter', function(req, res) {
//     console.log(req.body);
//     db.Availabilities.create({

//     });
// });

router.put('/renter/:id', function(req, res) {
    db.Properties.update( 
    {
        where: {
            id: req.params.id
        }
    });
});

// need to add a user placeholder to this route
router.get('/renter', function(req, res) {
    if (req.isAuthenticated()) {
        console.log('user logged in', req.user);
        res.render('renter.handlebars', {
            title: 'TMS | Rentals',
            scripts: script.renter,
            user: "Welcome, " + req.user.email,
            account_owner: "Properties",
            account_renter: "Renting",
            logout: 'Logout'
        });
    } else {
        console.log('user not logged in');
        res.redirect('/loginerror');
    }
});


function getJSONForDay(day, dayPrefix, id, req) {
    return {
        days: day,
        time_0: req.body[dayPrefix + '_zero'],
        time_1: req.body[dayPrefix + '_one'],
        time_2: req.body[dayPrefix + '_two'],
        time_3: req.body[dayPrefix + '_three'],
        time_4: req.body[dayPrefix + '_four'],
        time_5: req.body[dayPrefix + '_five'],
        time_6: req.body[dayPrefix + '_six'],
        time_7: req.body[dayPrefix + '_seven'],
        time_8: req.body[dayPrefix + '_eight'],
        time_9: req.body[dayPrefix + '_nine'],
        time_10: req.body[dayPrefix + '_ten'],
        time_11: req.body[dayPrefix + '_eleven'],
        time_12: req.body[dayPrefix + '_twelve'],
        time_13: req.body[dayPrefix + '_thirteen'],
        time_14: req.body[dayPrefix + '_fourteen'],
        time_15: req.body[dayPrefix + '_fifteen'],
        time_16: req.body[dayPrefix + '_sixteen'],
        time_17: req.body[dayPrefix + '_seventeen'],
        time_18: req.body[dayPrefix + '_eighteen'],
        time_19: req.body[dayPrefix + '_nineteen'],
        time_20: req.body[dayPrefix + '_twenty'],
        time_21: req.body[dayPrefix + '_twentyone'],
        time_22: req.body[dayPrefix + '_twentytwo'],
        time_23: req.body[dayPrefix + '_twentythree'],
        PropertyId: id
    };
}
router.post("/", function(req, res) {

    db.Properties.create({
        zipcode: req.body.zipcode,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        price: req.body.price,
        UserId: req.user.id

    }).then(function(dbRes) {
        Promise.all([
            db.Schedules.create(getJSONForDay(req.body.monday, 'm', dbRes.id, req)),
            db.Schedules.create(getJSONForDay(req.body.tuesday, 't', dbRes.id, req)),
            db.Schedules.create(getJSONForDay(req.body.wednesday, 'w', dbRes.id, req)),
            db.Schedules.create(getJSONForDay(req.body.thursday, 'th', dbRes.id, req)),
            db.Schedules.create(getJSONForDay(req.body.friday, 'f', dbRes.id, req)),
            db.Schedules.create(getJSONForDay(req.body.saturday, 'sa', dbRes.id, req)),
            db.Schedules.create(getJSONForDay(req.body.sunday, 'su', dbRes.id, req))
        ]).then(function () {
            res.redirect("/");            
        });
    });
});

router.get('/about', function(req, res) {
    if (req.user !== undefined) {
        res.render('about.handlebars', {
            title: 'TMS | About',
            scripts: script.about,
            user: "Welcome, " + req.user.email,
            account_owner: "Properties",
            account_renter: "Renting",
            logout: 'Logout'
        });
    } else {
        res.render('about.handlebars', {
            title: 'TMS | About',
            scripts: script.about
        });
    }
});

router.get('/owner', function(req, res) {
    if (req.isAuthenticated()) {
        console.log('user logged in', req.user);
        res.render('owner.handlebars', {
            title: 'TMS | Owner',
            scripts: script.owner,
            user: "Welcome, " + req.user.email,
            account_owner: "Properties",
            account_renter: "Renting",
            logout: 'Logout'
        });
    } else {
        console.log('user not logged in');
        res.redirect('/loginerror');
    }
});

router.get('/api/locations', function(req, res) {
    db.Properties.findAll({}).then(function(data) {
        res.json(data);
    });
});

router.get('/renter/property/:id', function(req, res) {
    db.Properties.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(data) {
        // this gives all info in the DB for the entry clicked
        console.log(data.dataValues);
    });
});


router.post("/", function(req, res) {
    var address = req.body.address + ", " + req.body.city;
    geocoder.geocode(address, function(err, data) {
        db.Properties.create({
            zipcode: req.body.zipcode,
            address: req.body.address,
            city: req.body.city,
            longitude: data.results[0].geometry.location.lng,
            latitude: data.results[0].geometry.location.lat,
            state: req.body.state,
            price: req.body.price,
            monday: req.body.monday,
            0: req.body.zero
        }).then(function(dbRes) {
            // res.json(dbRes);
            res.redirect("/");
        });
    });
});

router.get('/loginerror', function(req, res) {
    res.render('loginerror.handlebars', {
        title: 'TMS | Error'

    });
});

// --------------------------------------put this last---------------------------------
router.use(function(req, res) {
    if (req.user !== undefined) {
        res.render('landingPage.handlebars', {
            title: 'TMS | Welcome',
            scripts: script.login,
            user: "Welcome, " + req.user.email,
            account_owner: "Properties",
            account_renter: "Renting",
            logout: 'Logout'
        });
    } else {
        res.render('landingPage.handlebars', {
            title: 'TMS | Welcome',
            scripts: script.login
        });
    }
});


// Export routes for server.js to use.
module.exports = router;
