#!/home/toby/miniconda3/envs/toby/bin/python
from PIL import Image

# 打開彩色圖片
img = Image.open("Pikachu.jpg")

# 轉換為灰階 (Greyscale, 'L' mode)
bw_img = img.convert('L')

# 存檔
bw_img.save("Pikachu_bw.jpg")
print("✅ 圖片已成功變成黑白！")