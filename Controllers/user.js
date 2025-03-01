const bcrypt = require(`bcrypt`);
const Users = require("../Models/users")


exports.createUser =  async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const isUserExist = await Users.findOne({ where : { email : email } });

        if(isUserExist){

            res.status(400).json({
                success: false,
                message : `User already Exist!`
            });

        }else{

            const newId = Date.now();
            const salt = 10;
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const newUser = await Users.create({
              id: newId,
              name: name,
              email: email,
              password: hashedPassword,
            });

            res.status(201).json({
                success: true,
                data : newUser
            });
        }

    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const isUserExist = await Users.findOne({ where : { email : email } });

        if(!isUserExist){
            res.status(404).json({
                success: false,
                message : `User Not Exist!`
            });

            return; 
        }
        
        const isMatch = await bcrypt.compare(password, isUserExist.password)
        
        if(!isMatch){
            res.status(401).json({
                success: false,
                message : `User not authorized!`
            });
        } else{
            res.status(200).json({
                success: true,
                data : isUserExist
            });
        }

    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}
