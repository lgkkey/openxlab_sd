from fastapi import FastAPI
from pydantic import BaseModel
import threading
import os
import time
import uvicorn
import subprocess
import gradio as gr
fastapi_app=FastAPI()
script_path=r"E:\self\openxlab_sd\page\js"

class Item(BaseModel):
    pwd:str
    
@fastapi_app.post("/hello/get/list")
async def get_list(item:Item):
    print(item.pwd)
    res=run_cmd("ls -a",item.pwd)
    array_res=res.split("\n")
    if len(array_res) > 0:
        return [x for x in array_res if x.strip()]
    
    return [] 
def list_scripts(scriptdirpath):
    if (not os.path.isdir(script_path)):
        script_path_="./page/js"
    else:
        script_path_=script_path
    scripts_list = []
    if os.path.exists(scriptdirpath):
        for filename in sorted(os.listdir(scriptdirpath)):
            scripts_list.append(os.path.join(script_path_,filename))
            print(f"load js file:{filename}")
    return scripts_list

def javascript_html():
    # Ensure localization is in `window` before scripts
    # head = f'<script type="text/javascript">{localization.localization_js(shared.opts.localization)}</script>\n'
    head=""
    for js_ in list_scripts(script_path):
        
        with open(js_,"r",encoding="UTF-8") as f:
            js=f.read()
            head += f'<script defer>{js}</script>\n'

    return head

show_shell_info=False
def run_cmd(command, cwd=None, desc=None, errdesc=None, custom_env=None,try_error:bool=True) -> str:
    global show_shell_info
    if desc is not None:
        print(desc)

    run_kwargs = {
        "args": command,
        "shell": True,
        "cwd": cwd,
        "env": os.environ if custom_env is None else custom_env,
        "encoding": 'utf8',
        "errors": 'ignore',
    }

    if not show_shell_info:
        run_kwargs["stdout"] = run_kwargs["stderr"] = subprocess.PIPE
    try:
        result = subprocess.run(**run_kwargs)

    except subprocess.CalledProcessError as e:
        error_bits = [
            f"{errdesc or 'Error running command'}.",
            f"Command: {command}",
            f"Error code: {result.returncode}",
        ]
        if result.stdout:
            error_bits.append(f"stdout: {result.stdout}")
        if result.stderr:
            error_bits.append(f"stderr: {result.stderr}")
        if try_error:
            
            return RuntimeError("\n".join(error_bits))+"\n"+e
        else:
            raise RuntimeError("\n".join(error_bits))

    if show_shell_info:
        print((result.stdout or ""))
    return (result.stdout or "")


def output_txt(input,pwd):
    print(input)
    if pwd != "":
        res=run_cmd(input,cwd=pwd)
    else:
        res=run_cmd(input)
    return res
with gr.Blocks(head=javascript_html()) as demo:
    pwd=gr.Textbox(label="执行路径",elem_id = "pwd")
    input=gr.TextArea()
    output=gr.Textbox(lines=10)
    
    run=gr.Button("Run")
    clear=gr.Button("Clear")
    event=run.click(output_txt,inputs=[input,pwd],outputs=[output])
    clear.click(lambda: ["",""],inputs=[],outputs=[input,output])

    
 
fastapi_app=gr.mount_gradio_app(fastapi_app,demo,path="/hello")
uvicorn.run(fastapi_app,host='0.0.0.0',port=7890)
