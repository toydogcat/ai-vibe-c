#!/home/toby/miniconda3/envs/toby/bin/python
from PIL import Image

img = Image.open("Pikachu.png")

# 如果圖片是 RGBA，先轉成 RGB 再存成 JPG
if img.mode == 'RGBA':
    img = img.convert('RGB')

# 轉換格式並存檔 (例如轉成 JPEG，並調整品質)
# Pillow 會根據副檔名自動判斷格式
img.save("Pikachu.jpg", quality=85)
print("✅ 檔案格式轉換完成！")
