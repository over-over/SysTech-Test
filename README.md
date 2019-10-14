# Тестовое задание
Для сборки проекта использовались gulp, sass, babel и nunjucks для шаблонизации.
В /dev/ находятся все файлы для сборки:
- /data/ - JSON полученный из базы для nunjucks
- /layout/ - основные стили для разметки
- /lib/ - компоненты
- /scss/ - финальный scss файл
- /svg/ - svg иконки и спрайт
- /templates/ - основной шаблон nunjucks

### Код запроса к базе
```sql
SELECT docs.date, docTypes.name as docName, docs.id, products.name, products.image, products.price, rows.quantity, products.removed FROM docs
INNER JOIN docTypes ON docs.typeId = docTypes.id
INNER JOIN rows ON docs.id = rows.docId
INNER JOIN products ON rows.productId = products.id
WHERE docs.removed = 0 AND docTypes.removed = 0 AND rows.removed = 0
ORDER BY docs.date;
```

### Обработка данных из базы JavaScript'ом в gulpfile.js
```js
    const newData = {};
    data.forEach((item) => {
        const dateKey = item.date.substr(0,10);
        if(newData[dateKey] == undefined){
            newData[dateKey] = {
                dateName: new Date(dateKey).toLocaleDateString('ru', {
                    month: 'long',
                    day: 'numeric'
                }),
                docs: {},
                docsPrice: 0,
            };
        }
        if(newData[dateKey].docs[item.id] == undefined){
            newData[dateKey].docs[item.id] = {docName: item.docName, docPrice: 0, products: []};
        }
        const newItem = {
            productName: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            isRemoved: item.removed,
        }
        newData[dateKey].docs[item.id].products.push(newItem);
        newData[dateKey].docs[item.id].docPrice += item.price;
        newData[dateKey].docsPrice += item.price;
    });

    return newData;
```

