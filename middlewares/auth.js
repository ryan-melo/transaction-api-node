import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

const auth = (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).json({ message: 'Token não encontrado' })
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET)
        console.log(decoded)
        req.user = decoded
        console.log(req.user)
        next()
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' })
    }
}

export default auth