

// const mysql = require('mysql2');

// const { faker } = require('@faker-js/faker');

import mysql from 'mysql2';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import path from 'path';
import methodOverride from 'method-override';
import session from 'express-session';
import flash from 'connect-flash';



const app = express();



app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your_super_secret_key_987654321',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, '/views')); 

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ajay@123',
  database: 'Delta_app'
});

app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM user";
         try {
connection.query(q, (err, results) => {

        if(err)  throw err;
        // console.log(results[0]["count(*)"]);
        res.render("home.ejs", { count: results[0]["count(*)"] });
});
    } catch(err) {
        console.log(err);
        res.send(err);
    }

    // connection.end();
  
});


app.get("/users", (req, res) => {

  let q = "SELECT * FROM user";
         try {
connection.query(q, (err, results) => {

        if(err)  throw err;
        // console.log({results});
        let users = results;
        res.render("show.ejs", { users });
});
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});

app.get("/users/:id/eddit", (req, res) => {

     let { id } = req.params;
    //  console.log(id);
  let q = `SELECT * FROM user WHERE id = "${id}"`;
         try {
connection.query(q, (err, result) => {

        if(err)  throw err;   
        // console.log(result);
        let user = result[0];
        res.render("eddit.ejs", { user });
});
    } catch(err) {
        // console.log(err);
        res.send(err);
    }
    
            
});

app.patch("/users/:id", (req, res) => {
           let { id } = req.params;

       let  { username: newusername, password:formpass } =  req.body;

       let q = `SELECT * FROM user WHERE id = "${id}"`;
         try {
connection.query(q, (err, result) => {

        if(err)  throw err;   
        // console.log(result);
        // let user = result[0];
        // console.log(result[0]);
        if(formpass != result[0].password){
             req.flash("error", "Password doesn't Match.")
          return res.redirect(`/users/${id}/eddit`);
        }else {
          // res.send("right");
          let q2 = `UPDATE user SET username = "${newusername}" WHERE id = "${id}"`;
          try {
            connection.query(q2, (err, result) => {
                      if(err) throw err
                      // res.send(result);
                      req.flash("success", "Username successfully Eddited.")
                      res.redirect("/users");
            })
          }catch(err) {
            console.log(err);
          }
        }
});
    } catch(err) {
        console.log(err);
        res.send(err);
    }
       
});

app.get("/users/add", (req, res) => {
  res.render("join.ejs");
});

app.post("/users", (req, res) => {
       const { id, username, email, password } = req.body;

       if (!id || !username || !email || !password) {
             req.flash('error', 'त्रुटि: सभी फ़ील्ड भरना आवश्यक है!'); 
             res.redirect("/users/add");
       }else {
      //  res.send(data);
      //  console.log(id, username, email, password);
       let q = "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";
       let data = [id, username, email, password];
       try{

             connection.query(q, data, (err, result) => {
                      if(err){
                        console.log(err);
                         
                         if(err.code === "ER_DUP_ENTRY" || err.errno === 1062){
                               req.flash("error", "This ID is allredy exist.")
                               return res.redirect("/users/add");
                         }else {
                                   req.flash("error", "Something error in DATABASE");
                                   return res.redirect("/users/add");
                         }
                      }
                      // res.send(result);
                      req.flash('success', 'Infomation is saved.'); 
                      res.redirect("/users");
            })
          }catch(err) {
            console.log(err);
          }  
          
        }
       
});

app.delete("/users/:id", (req, res) => {

     let { id } = req.params;

     let q = `DELETE FROM user WHERE id = "${id}"`;
     
       try {
connection.query(q, (err, results) => {

        if(err) throw err;
         req.flash('success', 'Successfully Deleted.');
        //  console.log(id);
         res.redirect("/users");
        
});
    } catch(err) {
        console.log(err);
        req.flash("error", "Does not Delete successfully.");
    }
     
});



app.listen(3030, () => {
  console.log(`Server is running on http://localhost:3030`);

});



async function generateUsersArray(count) {
  const usersList = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const password = faker.internet.password();
    
    usersList.push([
         uuidv4(),
       `${firstName} ${lastName}`,
          email,
          password
    ]);
  }
  return usersList;
}

const usersData = await generateUsersArray(100); 
// console.log(usersData);

let data = [];



// let q = "SELECT COUNT(roll_no) AS total_student FROM student";
// let q = "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";
// let user = ["123", "123_newuser", "newuser123@gamil.com", "abc"];
 let q = "INSERT INTO user (id, username, email, password) VALUES ?";
let users = [ 
  ["1234", "1234_newuser", "newuser1234@gmail.com", "abcd"],
  ["12345", "12345_newuser", "newuser12345@gmail.com", "abcde"], 
];

//        try {
// connection.query(q, [ usersData ], (err, results) => {

//         if(err) throw err;
//         console.log(results);
        
// });
//     } catch(err) {
//         console.log(err);
//     }

//     connection.end();