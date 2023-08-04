import Users from "../models/userModels.js";
import bcrypt from "bcrypt"; //digunakan untuk meng-hash password
import jwt from "jsonwebtoken";  //digunakan untuk function login
import { json } from "sequelize";

export const getUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id','name','email']
        });
        res.json(users);
    } catch (error) {
        console.error(error);
    }
}

export const Register = async(req, res) => {
    const {name, email, password, confirmPassword} = req.body;
    if (password != confirmPassword) {
        return res.status(400).json({msg: "Password doesn't match"}); //jika password dan confirmPassword tidak cocok jalankan fungsi ini
    } 
    const salt = await bcrypt.genSalt(); // jalankan fungsi ini jika password match
    const hashPassword = await bcrypt.hash(password,salt) //jalankan fungsi ini untuk meng-hash password
    try {
        await Users.create({
            name : name, 
            email : email,
            password : hashPassword, 
        });
        res.json({msg : 'Register Success'});
    } catch (error) {
        console.error(error);
    }

}

export const Login = async(req, res) => {
    console.log(req.body.email)
    try {
        const user = await Users.findAll({
            where:{
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(400).json({msg : "Sorry, Wrong Password"});
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '30s'
        });
        console.log(accessToken);
        const refreshToken = jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        console.log(refreshToken);
        await Users.update({refresh_token: refreshToken},{
            where : {
                id : userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
            // secure: true  //https only (keamanan)
        });
        res.json({ accessToken }); //mengirim access token ke client.
    } catch (error) {
        res.status(404).json({msg : 'Wrong Email'})
    }
}

export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.sendStatus(204); //no containt
        const user = await Users.findAll({
            where: {
                refresh_token : refreshToken
            }
        });
        if (!user[0]) return res.sendStatus(204); //no containt
        const userId = user[0].id;
        await Users.update({ refreshToken:null }, { //set refToken jadi null
            where : {
                id: userId
            }
        });
        res.clearCookie('refreshToken');
        return res.sendStatus(200); //OK
}