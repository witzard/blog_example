"use server"

import prisma from "@/utils/db";
import { revalidatePath } from "next/cache";

export async function likePost(id:number){
    try {
        const likePost = await prisma.post.update({
            where: {
                id,
            },
            data: {
                like: {increment:1},
            },
        });
        revalidatePath("/blog")
    }
    catch (error) {
        return { error: { message: error + "" } }
    }
   
}

export async function unlikePost(id:number){
    try {
        const unlikePost = await prisma.post.update({
            where: {
                id,
            },
            data: {
                like: {decrement:1},
            },
        });
        revalidatePath("/blog")
    }
    catch (error) {
        return { error: { message: error + "" } }
    }
   
}