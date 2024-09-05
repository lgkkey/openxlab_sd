import os
import subprocess
import time
import threading
import hashlib
import uvicorn
import multiprocessing

def get_file_md5(filename):
    hash_md5 = hashlib.md5()
    with open(filename, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


os.system("pwd")
os.system("ls -la")
root_path="/home/xlab-app-center"
def cd_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)
    os.chdir(path)

print("---------------launch.py-----------------------")
def install_run_nginx():
    # 切换工作目录
    build_dir=f"{root_path}/nginx_build"
    install_dir=f"{root_path}/nginx"
    cd_dir(build_dir)
    #判断是否安装nginx
    if os.path.exists(f"{install_dir}/nginx"):
        if os.path.exists(f"{root_path}/openxlab_sd/nginx.conf"):
            os.system(f"{install_dir}/nginx -c {root_path}/openxlab_sd/nginx.conf") 
        else:
            print("nginx.conf not found")
            os.system(f"{install_dir}/nginx -c /home/xlab-app-center/openxlab_sd/nginx.conf")
        return
    # 下载源码
    if not os.path.exists(f"{build_dir}/release-1.26.1.tar.gz") or get_file_md5(f"{build_dir}/release-1.26.1.tar.gz")!="7d0651b270632e1800bb281c669023aa":
        os.system("wget https://github.com/nginx/nginx/archive/refs/tags/release-1.26.1.tar.gz --no-check-certificat ")
    md5sum=get_file_md5(f"{build_dir}/release-1.26.1.tar.gz")
    if (md5sum!="7d0651b270632e1800bb281c669023aa"):
        print("release-1.26.1.tar.gz md5sum error")
    print("解压release-1.26.1.tar.gz")
    os.system(f"tar -xf release-1.26.1.tar.gz -C {build_dir}")
    
    # 执行configure
    os.chdir(f"{build_dir}/nginx-release-1.26.1")
    configure=f"""
./auto/configure \
    --prefix={install_dir}  \
    --sbin-path={install_dir}/nginx \
    --conf-path={install_dir}/nginx.conf \
    --error-log-path={install_dir}/error.log \
    --http-log-path={install_dir}/access.log \
    --pid-path={install_dir}/nginx.pid \
    --lock-path={install_dir}/lock/nginx.lock \
    --user=xlab-app-center \
    --group=xlab-app-center \
    --with-http_ssl_module \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --http-client-body-temp-path={install_dir}/client/ \
    --http-proxy-temp-path=/{install_dir}/proxy/ \
    --http-fastcgi-temp-path={install_dir}/fcgi/ \
    --http-uwsgi-temp-path={install_dir}/uwsgi \
    --http-scgi-temp-path={install_dir}/scgi \
    --with-pcre 
    """
    print(configure)
    print("-------------------")
    os.system(configure)
    # 执行make
    os.system("make")
    # 执行make install
    os.system("make install")
    # 修改配置文件
    # 启动nginx
    if os.path.exists(f"{install_dir}/nginx"):
        if os.path.exists(f"{root_path}/openxlab_sd/nginx.conf"):
            os.system(f"{install_dir}/nginx -c {root_path}/openxlab_sd/nginx.conf") 
        else:
            print("nginx.conf not found")
            os.system(f"{install_dir}/nginx -c /home/xlab-app-center/openxlab_sd/nginx.conf")

def launch_app1():
    app1=f"{root_path}/openxlab_sd/page/app1.py"
    if os.path.exists(app1):
        os.system(f"python {app1}")

# threading.Thread(target=launch_app1).start()

    
print("install nginx")
install_run_nginx()
print("finish nginx")

def launch_sd():
    app=f"{root_path}/openxlab_sd/page/sd.py"
    if os.path.exists(app):
        os.system(f"python {app}")


os.chdir(root_path)
# 启动任务
app1=multiprocessing.Process(target=launch_app1)
app1.start()

app2=multiprocessing.Process(target=launch_sd)
app2.start()

while True:
    # os.system(f"python main.py --cpu --listen ")
    time.sleep(10)