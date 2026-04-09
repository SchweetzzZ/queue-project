-- DropForeignKey
ALTER TABLE "CompanySettings" DROP CONSTRAINT "CompanySettings_companyId_fkey";

-- AddForeignKey
ALTER TABLE "CompanySettings" ADD CONSTRAINT "CompanySettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
