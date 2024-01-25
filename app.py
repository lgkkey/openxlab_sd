import os
os.system("pwd")
os.system("ls -la")
os.system("rm -rf app_start.py")
os.system("rm -rf openxlab_start")
os.system("ls -la")
print("--------------------------------------")
os.system("git clone https://github.com/lgkkey/openxlab_start.git")
if os.path.exists("openxlab_start"):
    os.system("cp openxlab_start/app_start.py ./")
else:
    os.system("git clone https://github.com/lgkkey/openxlab_start.git")
    
if os.path.exists("app_start.py"):
    print("app_start.py exists")

os.system("ls -la")
print("----------------start app_start.py----------------------")

os.system(f"python app_start.py")
