/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `currentQuantity` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `isRecorrente` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `maxRecordedPrice` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `minRecordedPrice` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `PurchaseRecord` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `PurchaseRecord` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerUnit` on the `PurchaseRecord` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `PurchaseRecord` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `PurchaseRecord` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PurchaseRecord` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nome` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preco_total` to the `PurchaseRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preco_unitario` to the `PurchaseRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade` to the `PurchaseRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `PurchaseRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha_hash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Item" DROP CONSTRAINT "Item_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Item" DROP CONSTRAINT "Item_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseRecord" DROP CONSTRAINT "PurchaseRecord_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Item" DROP COLUMN "categoryId",
DROP COLUMN "currentQuantity",
DROP COLUMN "isRecorrente",
DROP COLUMN "maxRecordedPrice",
DROP COLUMN "minRecordedPrice",
DROP COLUMN "name",
DROP COLUMN "photoUrl",
DROP COLUMN "userId",
ADD COLUMN     "categoriaId" TEXT,
ADD COLUMN     "foto_url" TEXT,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "preco_maximo" DOUBLE PRECISION,
ADD COLUMN     "preco_minimo" DOUBLE PRECISION,
ADD COLUMN     "quantidade_atual" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recorrente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."PurchaseRecord" DROP COLUMN "date",
DROP COLUMN "notes",
DROP COLUMN "pricePerUnit",
DROP COLUMN "quantity",
DROP COLUMN "totalPrice",
DROP COLUMN "userId",
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "preco_total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "preco_unitario" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantidade" INTEGER NOT NULL,
ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "name",
DROP COLUMN "passwordHash",
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "senha_hash" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Category";

-- CreateTable
CREATE TABLE "public"."Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "public"."Categoria"("nome");

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseRecord" ADD CONSTRAINT "PurchaseRecord_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
