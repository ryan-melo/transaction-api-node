import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const router = express.Router()

// function verificarNumero(valor) {
//     if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
//         return Math.abs(valor);
//     } else {
//         res.status(500).json({ message: 'Erro ao realizar depósito' })
//     }
// }


router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                cpf: true,
            }
        })
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários' })
    }
})

router.post('/deposito', async (req, res) => {
    try {
        const valor = req.body.valor
        const id = req.user.id
        const valorAbs = Math.abs(valor)

        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' })
        }

        await prisma.user.update({
            where: {
                id
            },
            data: {
                saldo: user.saldo + valorAbs,
                modificationHistory: {
                    push: {
                        date: new Date().toISOString(),
                        reason: `Depósito de R$ ${valorAbs}`
                    }
                }
            }
        })

        res.status(200).json({ message: 'Depósito realizado com sucesso' })

    } catch (error) {
        res.status(500).json({ message: 'Erro ao realizar depósito' })
    }
})

router.post('/saque', async (req, res) => {
    try {
        const id = req.user.id

        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' })
        }

        if (user.saldo < req.body.valor) {
            return res.status(400).json({ message: 'Saldo insuficiente' })
        }

        await prisma.user.update({
            where: {
                id
            },
            data: {
                saldo: user.saldo - req.body.valor,
                modificationHistory: {
                    push: {
                        date: new Date().toISOString(),
                        reason: `Saque de R$ ${req.body.valor}`
                    }
                }
            }
        })

        res.status(200).json({ message: 'Saque realizado com sucesso' })

    } catch (error) {
        res.status(500).json({ message: 'Erro ao realizar saque' })
    }
})

router.get('/extrato', async (req, res) => {
    try {
        const id = req.user.id

        const user = await prisma.user.findUnique({
            where: {
                id
            },
            select: {
                modificationHistory: true,
                saldo: true
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' })
        }

        res.status(200).json({ saldo: user.saldo, extrato: user.modificationHistory })

    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar extrato' })
    }
})

router.post('/transferencia', async (req, res) => {
    try {
        const id = req.user.id
        const { cpf, valor } = req.body

        if (!id) {
            return res.status(404).json({ message: 'Usuário não encontrado' })
        }

        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' })
        }

        if (user.saldo < Math.abs(valor)) {
            return res.status(400).json({ message: 'Saldo insuficiente' })
        }

        const userDestino = await prisma.user.findUnique({
            where: {
                cpf
            }
        })

        if (!userDestino) {
            return res.status(404).json({ message: 'Usuário destino não encontrado' })
        }

        await prisma.user.update({
            where: {
                id
            },
            data: {
                saldo: user.saldo - Math.abs(valor),
                modificationHistory: {
                    push: {
                        date: new Date().toISOString(),
                        reason: `Transferência de R$ ${Math.abs(valor)} para ${userDestino.name}`
                    }
                }
            }
        })

        await prisma.user.update({
            where: {
                cpf
            },
            data: {
                saldo: userDestino.saldo + Math.abs(valor),
                modificationHistory: {
                    push: {
                        date: new Date().toISOString(),
                        reason: `Recebimento de R$ ${Math.abs(valor)} de ${user.name}`
                    }
                }
            }
        })

        res.status(200).json({ message: 'Transferência realizada com sucesso' })

    } catch (error) {
        res.status(500).json({ message: 'Erro ao realizar transferência' })
    }
})

export default router