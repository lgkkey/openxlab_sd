import os
os.system("pwd")
os.system("ls -la")
print("--------------------------------------")

# 更新文件
root_path="/home/xlab-app-center"
launch="https://github.com/lgkkey/openxlab_sd.git"


def update_lauch():
    if (os.path.exists(f"{root_path}/openxlab_sd")):
        print("openxlab_sd exists")
        os.system(f"rm -rf {root_path}/openxlab_sd")

    print(f"git clone {launch}")
    os.system(f"git clone {launch}")
    if (not os.path.exists(f"{root_path}/openxlab_sd")):
        raise Exception("git clon faild!!")

    if (os.path.exists(f"{root_path}/launch.py")):
        print("launch.py exists")
        os.system(f"mv {root_path}/launch.py {root_path}/launch_bak.py")
        os.system(f"cp {root_path}/openxlab_sd/launch.py {root_path}/launch.py")
        os.system(f"cat {root_path}/launch.py")
        if (os.path.exists(f"{root_path}/launch.py")):
            print("launch.py update success")
        else:
            print("launch.py update fail")
            raise Exception("launch.py update fail")

        print("--------------------------------------")

for i in range(1,10):
    try:
        print(f"-----------------try to update launch.py---{i}------------------")
        update_lauch()
        break
    except Exception as e:
        print(e)
        
        
os.system("ls -la")
print("----------------start launch.py----------------------")
os.chdir(root_path)
if os.path.exists("{root_path}/launch.py"):
    os.system("python launch.py")
else:
    os.system("python launch_bak.py")