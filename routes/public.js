import express from 'express'
import { PrismaClient } from '@prisma/client'
import logger from '../middlewares/logging.js'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET

router.post('/cadastro', async (req, res) => {
    
    try {
        const user = req.body

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password, salt);

        await prisma.user.create({
            data: {
                name: user.name,
                cpf: user.cpf,
                saldo: user.saldo,
                password: hash,
                modificationHistory: {
                    push: {
                    date: new Date().toISOString(),
                    reason: "Usuario criado"
                    }
                }
            }
        })
        res.action = 'conta criada'
        res.status(201).json({ message: 'Usuário criado com sucesso' })
    } catch(err) {
        res.status(500).json({ message: 'Erro ao criar usuário' })
    }

})

router.post('/login', async (req, res) => {

    logger.info('Aplicação iniciada!');

    try {
        const user = req.body

        const userDb = await prisma.user.findUnique({
            where: {
                cpf: user.cpf
            }
        })

        if (!userDb) {
            return res.status(404).json({ message: 'Usuário não encontrado' })
        }

        if (!bcrypt.compareSync(user.password, userDb.password)) {
            return res.status(401).json({ message: 'Senha incorreta' })
        }

        const token = jwt.sign({ id: userDb.id }, JWT_SECRET, { expiresIn: 60 })

        res.status(200).json(token)

    } catch (error) {

        res.status(500).json({ message: 'Erro ao efetuar login' })
    }

    
})

export default router
