import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { token } = req.query

    if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Invalid token' })
    }

    // Redirect to upload page with token
    res.redirect(`/upload?token=${token}`)
} 