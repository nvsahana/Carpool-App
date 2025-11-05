-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "profilePath" TEXT,
    "role" TEXT NOT NULL,
    "willingToTake" INTEGER[],
    "hasDriversLicense" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAddress" (
    "id" SERIAL NOT NULL,
    "officeName" TEXT,
    "street" TEXT,
    "city" TEXT,
    "zipcode" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CompanyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeAddress" (
    "id" SERIAL NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zipcode" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "HomeAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAddress_userId_key" ON "CompanyAddress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeAddress_userId_key" ON "HomeAddress"("userId");

-- AddForeignKey
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeAddress" ADD CONSTRAINT "HomeAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
