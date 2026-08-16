# JINHUAN Product Images

商品图片放在这个目录下，建议每个商品一个文件夹，例如：

- `assets/products/JH-001/01.jpg`
- `assets/products/JH-001/02.jpg`
- `assets/products/JH-001/03.jpg`

在 Squidex `products.imageUrls` 字段里填写：

```text
JH-001/01.jpg
JH-001/02.jpg
JH-001/03.jpg
```

前台会自动转换为：

`https://jinhuan.me/assets/products/JH-001/01.jpg`

建议上传已经压缩过的 WebP/JPG 商品图，避免仓库和网页体积过大。
