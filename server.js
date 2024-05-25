const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json())

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite' // database file path
})

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password:
    {
        type: DataTypes.STRING,
        allowNull: false
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: username,
            password: hashedPassword
        })

        res.send('Registration successful. You can now login.\n')
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError')
            return res.status(400).send('Username already exists.\n')
        res.status(500).send('An error occured during registration.\n')
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username: username }});
    if (!user)
        return res.status(400).send('Invalid username or password.\n');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
        return res.status(400).send('Invalid username or password')

    res.send('Login successful. Welcome back, ' + username + '!\n');
});

sequelize.sync()
    .then(() => {
        console.log('Database synchronized.\n');
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    })
    .catch(err => {
        console.error('Unable to sync database:', err);
    });