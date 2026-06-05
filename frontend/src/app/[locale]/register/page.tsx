import { MultiStepForm } from "@/components/registration/MultiStepForm";

interface RegisterPageProps {
  params: { locale: string };
}

export default function RegisterPage({ params: { locale } }: RegisterPageProps) {
  return <MultiStepForm locale={locale} />;
}
