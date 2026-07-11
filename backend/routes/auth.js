require('dotenv').config();
const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const SECRET = process.env.SECRET_TOKEN;


router.post('/login', async (req, res) =>{
    
    const { username, password, email, } = req.body;

    if(!username || !password){
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const validation = validatedData(null, email, password);

    if(validation.valid == false){
        return res.status(400).json({error: validation.error});
    }

    const result = await db.query(
        "SELECT 1 FROM mj_users WHERE email = ? OR username = ? LIMIT 1", [email,username]
    );

    if(result.length <= 0){
        return res.status(400).json({error: 'Este usuario no existe!'})
    }

    

})


router.post('/register', async (req, res) =>{
    try{
        const { username, password, email, name, lastName } = req.body || {};

        if(!username || !password || !email || !lastName || !name){
            return res.status(400).json({ error: 'Todos los campos son requeridos!' });
        }

        const validation = validatedData(username, email, password);

        if(validation.valid == false){
            return res.status(400).json({error: validation.error})

        }

        const result = await db.query(
            `SELECT
                EXISTS(
                 SELECT 1
                 FROM mj_users
                 WHERE email = ?
                ) AS email_exists,
                EXISTS(
                 SELECT 1
                 FROM mj_users
                 WHERE username = ?
                ) AS username_exists
            `,[email,username]);

        if(result.email_exists > 0){
            res.status(400).json({error: "Este correo electronico ya existe!"});
        }
        
        if(result.username_exists > 0){
            res.status(400).json({error: "Este nombre de usuario ya existe!"});
        }

        const hashPass = await hashPassword(password);

        const [data] = await db.query(`
            INSERT INTO mj_users (username, name, lastName, email, password)
            VALUES (?, ?, ?, ?, ?)
        `, [username, name, lastName, email, hashPass]);

        return res.json(data)

    }catch(error){
        console.log("Error", error)
    }
})


function validatedData(username, email, password){
    if(username != null){
        if(!username){
            return {
                valid: false,
                error: "El nombre de usuario no es valido!"
            };
        }
    }

    if(!email){
        return {
            valid: false,
            error: "El correo electronico no es valido!"
        };
    }

    if (password.length < 8) {
        return {
            valid: false,
            error: "La contraseña debe tener al menos 8 caracteres"
        };
    }

    if (!/[a-zA-Z]/.test(password)) {
        return {
            valid: false,
            error: "La contraseña debe contener al menos una letra"
        };
    }

    if (!/\d/.test(password)) {
        return {
            valid: false,
            error: "La contraseña debe contener al menos un número"
        };
    }

    return {
        valid: true
    };
}


async function hashPassword(password){
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

async function verifyPassword(password, hash){
    const hashedPassword = await bcrypt.compare(password, hash)
    return hashedPassword;
}

module.exports = router;