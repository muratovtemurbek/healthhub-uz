import { Heart } from 'lucide-react';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export default function Footer({ variant = 'default' }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 HealthHub UZ
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">HealthHub UZ</span>
            </div>
            <p className="text-sm">
              O'zbekiston uchun zamonaviy sog'liqni saqlash platformasi
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Xizmatlar</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">AI Tashxis</a></li>
              <li><a href="#" className="hover:text-white">Shifokorlar</a></li>
              <li><a href="#" className="hover:text-white">Dori narxlari</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Kompaniya</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Biz haqimizda</a></li>
              <li><a href="#" className="hover:text-white">Bog'lanish</a></li>
              <li><a href="#" className="hover:text-white">Maxfiylik</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Aloqa</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 info@healthhub.uz</li>
              <li>📞 +998 71 123 45 67</li>
              <li>📍 Toshkent, O'zbekiston</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© 2025 HealthHub UZ. Barcha huquqlar himoyalangan. 🇺🇿</p>
        </div>
      </div>
    </footer>
  );
}