import os
os.chdir(f"/home/xlab-app-center")
os.system(f"git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui /home/xlab-app-center/stable-diffusion-webui")
os.chdir(f"/home/xlab-app-center/stable-diffusion-webui")
os.system(f"git lfs install")
os.system(f"git reset --hard")
os.chdir(f"/home/xlab-app-center/stable-diffusion-webui/extensions")
import os

plugins = [
    "https://gitcode.net/overbill1683/stable-diffusion-webui-localization-zh_Hans",
    "https://gitcode.net/ranting8323/multidiffusion-upscaler-for-automatic1111",
    "https://gitcode.net/ranting8323/adetailer",
    "https://gitcode.net/ranting8323/sd-webui-prompt-all-in-one",
    "https://gitcode.net/ranting8323/sd-webui-inpaint-anything",
    "https://gitcode.net/ranting8323/a1111-sd-webui-tagcomplete",
    "https://github.com/zanllp/sd-webui-infinite-image-browsing",
    "https://github.com/vladmandic/sd-extension-system-info"
]

for plugin in plugins:
    os.system(f"git clone {plugin}")

os.chdir(f"/home/xlab-app-center/stable-diffusion-webui/models/adetailer")
os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://hf-mirror.com/Bingsu/adetailer/resolve/main/hand_yolov8s.pt -d /home/xlab-app-center/stable-diffusion-webui/models/adetailer -o hand_yolov8s.pt")
os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://hf-mirror.com/Bingsu/adetailer/resolve/main/hand_yolov8n.pt -d /home/xlab-app-center/stable-diffusion-webui/models/adetailer -o hand_yolov8n.pt")
os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://hf-mirror.com/datasets/ACCC1380/private-model/resolve/main/kaggle/input/museum/131-half.safetensors -d /home/xlab-app-center/stable-diffusion-webui/models/Stable-diffusion -o 131-half.safetensors")
os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://hf-mirror.com/datasets/ACCC1380/private-model/resolve/main/ba.safetensors -d /home/xlab-app-center/stable-diffusion-webui/models/Lora -o ba.safetensors")
os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://hf-mirror.com/datasets/ACCC1380/private-model/resolve/main/racaco2.safetensors -d /home/xlab-app-center/stable-diffusion-webui/models/Lora -o racaco2.safetensors")
os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://hf-mirror.com/coinz/Add-detail/resolve/main/add_detail.safetensors -d /home/xlab-app-center/stable-diffusion-webui/models/Lora -o add_detail.safetensors")
os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://hf-mirror.com/datasets/VASVASVAS/vae/resolve/main/pastel-waifu-diffusion.vae.pt -d /home/xlab-app-center/stable-diffusion-webui/models/VAE -o pastel-waifu-diffusion.vae.pt")
# os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://download.openxlab.org.cn/models/camenduru/sdxl-refiner-1.0/weight//sd_xl_refiner_1.0.safetensors -d /home/xlab-app-center/stable-diffusion-webui/models/Stable-diffusion -o sd_xl_refiner_1.0.safetensors")
# os.system(f"aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://download.openxlab.org.cn/models/camenduru/cyber-realistic/weight//cyberrealistic_v32.safetensors -d /home/xlab-app-center/stable-diffusion-webui/models/Stable-diffusion -o cyberrealistic_v32.safetensors")
os.chdir(f"/home/xlab-app-center/stable-diffusion-webui")
print('webui launching...')
import os
package_envs = [
    {"env": "STABLE_DIFFUSION_REPO", "url": os.environ.get('STABLE_DIFFUSION_REPO', "https://gitcode.net/overbill1683/stablediffusion")},
    {"env": "STABLE_DIFFUSION_XL_REPO", "url": os.environ.get('STABLE_DIFFUSION_XL_REPO', "https://gitcode.net/overbill1683/generative-models")},
    {"env": "K_DIFFUSION_REPO", "url": os.environ.get('K_DIFFUSION_REPO', "https://gitcode.net/overbill1683/k-diffusion")},
    {"env": "CODEFORMER_REPO", "url": os.environ.get('CODEFORMER_REPO', "https://gitcode.net/overbill1683/CodeFormer")},
    {"env": "BLIP_REPO", "url": os.environ.get('BLIP_REPO', "https://gitcode.net/overbill1683/BLIP")},
]
os.environ["PIP_INDEX_URL"] = "https://mirrors.aliyun.com/pypi/simple/"
for i in package_envs:
    os.environ[i["env"]] = i["url"]
!pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
os.system(f"python launch.py --api --xformers --enable-insecure-extension-access --theme dark --gradio-queue --disable-safe-unpickle")
