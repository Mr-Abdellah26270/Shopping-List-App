# Shopping List App 🛒

تطبيق قائمة تسوق ثنائي اللغة (العربية/الإنجليزية) يعمل دون اتصال بالإنترنت باستخدام `localStorage`.

## Features

### Core Functionality
- **Add & remove items**: أضف عناصر جديدة واحذف ما لا تحتاج إليه.
- **Category tags**: صنّف العناصر باستخدام ألوان مميزة لكل فئة.
- **Purchase tracking**: علّم العناصر كمشتراة أو غير مشتراة مع إبراز بصري واضح.
- **Smart search & sort**: ابحث في الأسماء أو التصنيفات مع إبراز النتائج وفرز أبجديًا أو حسب الأحدث أو العناصر غير المشتراة.
- **Bilingual UI**: واجهة تدعم العربية (اتجاه RTL) والإنجليزية مع تبديل فوري للنصوص.
- **Theme toggle**: بدّل بين الوضعين الفاتح والداكن مع حفظ التفضيل.
- **Share options**: شارك القائمة عبر WhatsApp أو البريد الإلكتروني بصيغة مرتبة.
- **Local persistence**: يتم حفظ بياناتك آليًا في `localStorage` للعمل دون اتصال.

### List Management
- **Multiple Lists**: Create and manage multiple shopping lists (e.g., "Groceries", "Hardware Store").
- **Add & Delete Lists**: Easily add new lists and delete existing ones.
- **Rename Lists**: Rename lists to better organize your shopping.

### إدارة القوائم
- **قوائم متعددة**: قم بإنشاء وإدارة قوائم تسوق متعددة (على سبيل المثال، "البقالة"، "متجر الأجهزة").
- **إضافة وحذف القوائم**: يمكنك بسهولة إضافة قوائم جديدة وحذف القوائم الحالية.
- **إعادة تسمية القوائم**: قم بإعادة تسمية القوائم لتنظيم التسوق بشكل أفضل.



## Getting Started

### Getting Started
1. نزّل المستودع أو استخرجه في مجلد محلي.
2. افتح الملف `index.html` مباشرة في المتصفح.
3. سيتم حفظ العناصر تلقائيًا في `localStorage`.

## How It Works

### Data Persistence
- يتم تخزين العناصر في `localStorage` بصيغة JSON.
- كل عنصر يتبع البنية التالية:

```javascript
{
    name: "Item name",
    category: "Category name",
    purchased: false,
    timestamp: 1700000000000
}
```



## Project Structure

```
Shopping List App/
├── index.html           # واجهة المستخدم
├── script.js            # منطق التطبيق الأساسي
├── style.css            # الأنماط والتنسيقات
└── README.md            # هذا الملف
```

## Troubleshooting

### أداء التطبيق بطيء مع قوائم كبيرة
- **تقليل العناصر**: احذف العناصر القديمة أو المنتهية.

## Future Ideas
- [ ] قوائم مشتركة بين أكثر من مستخدم.
- [ ] مزيد من خيارات الفرز والتصفية.
- [ ] استيراد/تصدير للقوائم.
- [ ] إشعارات عند تحديث القائمة.

## License

هذا المشروع مفتوح المصدر ومتاح بموجب رخصة MIT.
