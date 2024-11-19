import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.aIModel.createMany({
    data: [
      {
        modelName: "GPT2",
        type: "gpt2",
        url: "",
        configUrl: "",
        otherUrl: {},
        framework: "Pytorch",
        version: "1.0",
        userId: "Admin",
      },
    ],
  })
  console.log("Default data has been seeded.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
