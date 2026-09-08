"""Blender background-only: tailored imperial canopy and heavy drapery.
No simulation/render, no image textures; glTF PBR velvet, shared low-cost geometry.
"""
import bpy
import math
from pathlib import Path

OUT=Path(__file__).resolve().parents[1]/'web/prototypes/imperial-table/assets/blender-hall'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
velvet=bpy.data.materials.new('Deep oxblood velvet');velvet.diffuse_color=(.115,.009,.018,1);velvet.use_nodes=True
bsdf=velvet.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=velvet.diffuse_color
bsdf.inputs['Roughness'].default_value=.94;bsdf.inputs['Sheen Weight'].default_value=.18
gold=bpy.data.materials.new('Muted embroidery');gold.diffuse_color=(.38,.22,.07,1);gold.use_nodes=True
g=gold.node_tree.nodes.get('Principled BSDF');g.inputs['Base Color'].default_value=gold.diffuse_color;g.inputs['Metallic'].default_value=.7;g.inputs['Roughness'].default_value=.44

def cloth(name,width,height,cx,cy,cz,kind):
    nx,ny=72,48;vertices=[];faces=[]
    for j in range(ny+1):
        v=j/ny
        for i in range(nx+1):
            u=i/nx;xx=(u-.5)*width
            if kind=='valance':
                hem=.4+.8*abs(math.sin(u*math.pi*3))
                yy=cy-v*hem;zz=cz+.13*math.sin(u*math.pi*32)*v
            else:
                gather=1-.28*math.sin(v*math.pi)**2 if kind=='side' else 1
                xx*=gather;yy=cy-v*height+.055*math.cos(u*19)*v**6
                zz=cz+(.12+.07*v)*math.sin(u*math.pi*18+.13*math.sin(v*5))+.035*math.sin(u*47+v*3)
                zz+=.12*v**8
            # Three world coordinates -> Blender Z-up; exporter restores Y-up.
            vertices.append((cx+xx,-zz,yy))
    for j in range(ny):
        for i in range(nx):
            a=j*(nx+1)+i;faces.append((a,a+nx+1,a+nx+2,a+1))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);mesh.materials.append(velvet);mesh.materials.append(gold)
    for face in mesh.polygons:
        face.use_smooth=True
        if face.index//nx>=ny-1:face.material_index=1
    solid=obj.modifiers.new('Heavy textile edge','SOLIDIFY');solid.thickness=.025
    return obj

cloth('Throne textile backdrop',8.2,12.0,0,13.9,-20.30,'back')
cloth('Left gathered drape',2.25,11.65,-3.5,13.95,-18.85,'side')
cloth('Right gathered drape',2.25,11.65,3.5,13.95,-18.85,'side')
cloth('Scalloped canopy valance',9.65,1.3,0,13.99,-16.10,'valance')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(OUT/'drapery.glb'),export_format='GLB',use_selection=True,
    export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
print('HALL_COMPLETE', (OUT/'drapery.glb').stat().st_size)
