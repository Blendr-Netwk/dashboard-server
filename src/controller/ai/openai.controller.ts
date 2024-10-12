import { getImages, saveImage } from '@/services/prisma/image';
import { generateImage, openaiCreateVariation } from '@/services/openai';
import { NextFunction, Request, Response } from 'express';
import { uploadImageFromUrl } from '@/services/aws/upload';


class OpenAIController {
    public async generateTextToImage(req: Request, res: Response, next: NextFunction) {

        try {

            const { prompt, size, quality } = req.body;
            const response = await generateImage(prompt, size, quality)
            if (!response.url) throw new Error('no url generated')

            const storedImg = await uploadImageFromUrl(response.url, req.user.id)

            await saveImage(req.user.id, {
                url: storedImg.Location,
                type: "generate",
                prompt: prompt,
                model: 'dall-e-3',
                size: size,
                quality: quality,
            })

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    public async generateVariation(req: Request, res: Response, next: NextFunction) {

        try {

            const { size } = req.body;

            const imgUrl = await openaiCreateVariation(req.file, size)

            const storedImg = await uploadImageFromUrl(imgUrl, req.user.id)

            await saveImage(req.user.id, {
                url: storedImg.Location,
                type: "variation",
                prompt: "",
                model: 'dall-e-3',
                size: size,
                quality: 'standard',
            })

            res.status(200).json(storedImg.Location);
        } catch (error) {

            next(error);
        }
    }


    public async getAllImages(req: Request, res: Response, next: NextFunction) {

        try {

            const images = await getImages()
            res.status(200).json(images);
        } catch (error) {

            next(error);
        }
    }


}

export default OpenAIController;