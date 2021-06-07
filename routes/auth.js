const bcrypt = require('bcryptjs');
const router = require('express').Router();
const User = require('../models/User');
const verify = require('./verifyToke');
const {
    registerValidation,
    loginValidation,
} = require('../utilies/validation');
const jwt = require('jsonwebtoken');

// Validation
router.post('/register', async (req, res) => {
    // Validate
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if email already in use
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send('"Email" already exists');

    // Hash The Password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
    });

    try {
        const savedUser = await user.save();
        res.send({ user: user._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    // Validation
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check the email existance
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid Credintials');

    // Check if password correct
    const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
    );
    if (!validPassword) return res.status(400).send('Invalid Password');

    // Create Token

    const token = jwt.sign(
        { _id: user._id, name: user.name, email: user.email },
        process.env.TOKEN_SECRET
    );

    res.header('auth-token', token).send(token);
});

router.get('/me', verify, (req, res) => {
    res.send(req.user);
});

module.exports = router;