import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'
import { createReadStream, readFileSync } from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export const config = {
    api: {
        bodyParser: false
    }
}

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    }
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const form = formidable({})
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, files] = await form.parse(req)
        const file = files.file?.[0]

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }

        // Upload to R2
        const fileStream = createReadStream(file.filepath)
        const key = `${Date.now()}-${file.originalFilename}`
        
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: file.mimetype || 'image/jpeg'
        }))

        const imageUrl = `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`

        // Convert image to base64
        const imageBuffer = readFileSync(file.filepath)
        const base64Image = imageBuffer.toString('base64')

        // Process with Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' })
        
        const prompt = `Extract the total minutes listened from this Spotify Wrapped screenshot. 
            Return ONLY the number, nothing else. If you can't find the number, return 0.`

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: file.mimetype || 'image/jpeg',
                    data: base64Image
                }
            }
        ])

        const minutes = parseInt(result.response.text().trim(), 10) || 0

        // Check if user is authenticated
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(200).json({ requiresAuth: true })
        }

        // Verify with Trackify API
        const trackifyRes = await fetch(`${process.env.TRACKIFY_API_URL}/api/me`, {
            headers: {
                Authorization: authHeader
            }
        })

        if (!trackifyRes.ok) {
            return res.status(200).json({ requiresAuth: true })
        }

        const userData = await trackifyRes.json()

        // Save to database
        const user = await prisma.user.upsert({
            where: { spotify_id: userData.spotify_id },
            update: {
                minutes,
                screenshot_url: imageUrl
            },
            create: {
                spotify_id: userData.spotify_id,
                name: userData.display_name,
                email: userData.email,
                image_url: userData.image_url,
                minutes,
                screenshot_url: imageUrl
            }
        })

        res.status(200).json({
            spotify_id: user.spotify_id,
            requiresAuth: false
        })
    } catch (error) {
        console.error('Upload error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
