const express = require('express');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const uniqId = require('uniqid')

const app = express();

const usersSchema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    secondName: Joi.string().min(3).required(),
    age: Joi.number().min(0).required(),
    city: Joi.string().min(2)
});

const usersListPath = path.join(__dirname, 'users.json')
app.use(express.json());

/**
* Получить всех пользователей
*/
app.get('/users', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    res.send({ users: usersData });
})

/**
* Получить конкретного пользователя
*/
app.get('/users/:id', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    const user = usersData.find((user) => user.id === req.params.id);

    if (user) {
        res.send({ user });
    } else {
        res.status(404);
        res.send({
            user: null,
            message: "Пользователь не найден"
        });
    }
})

/**
* Создать нового пользователя
*/
app.post('/users', (req, res) => {
    const validateData = usersSchema.validate(req.body);
    if (validateData.error) {
        return res.status(400).send({ error: validateData.error.details })
    }
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    let unId = uniqId();
    usersData.push({
        id: unId,
        ...req.body
    });
    fs.writeFileSync(usersListPath, JSON.stringify(usersData));

    res.send({
        id: unId
    })

})


/**
* Обновление данных пользователя
*/
app.put('/users/:id', (req, res) => {
    const validateData = usersSchema.validate(req.body);
    if (validateData.error) {
        return res.status(400).send({ error: validateData.error.details })
    }
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    const user = usersData.find((user) => user.id === req.params.id);

    if (user) {
        user.firstName = req.body.firstName;
        user.secondName = req.body.secondName;
        user.age = req.body.age;
        user.city = req.body.city;

        fs.writeFileSync(usersListPath, JSON.stringify(usersData));

        res.send({ user });
    } else {
        res.status(404);
        res.send({
            user: null,
            message: "Пользователь не найден"
        });
    }
})


/**
* Удаление пользователя
*/
app.delete('/users/:id', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    const userIndex = usersData.findIndex((user) => user.id === req.params.id);

    if (userIndex > -1) {
        usersData.splice(userIndex, 1);
        fs.writeFileSync(usersListPath, JSON.stringify(usersData));

        res.send({ message: `Пользователь c id: ${req.params.id} успешно удален!` });
    } else {
        res.status(404);
        res.send({ message: 'Пользователь не найден!' });
    }
})

/**
* Обработка несуществующих роутов
*/
app.use((req, res) => {
    res.status(404).send({
        message: 'URL not found'
    })
})

const port = 3000;
app.listen(port, () => {
    console.log(`Сервер запущен на проту ${port}`);
});