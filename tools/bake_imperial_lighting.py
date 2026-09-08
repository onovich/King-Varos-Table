"""Bounded, CPU-only Cycles bake for the independent Three.js banquet.
Creates 1K HDR environment, 1K tabletop indirect light and contact AO.
The room is a lighting proxy matching world dimensions, not a second gameplay scene.
"""
import bpy
import math
import json
import time
from pathlib import Path
from mathutils import Vector

START=time.monotonic()
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'web/prototypes/imperial-table/assets'
OUT=ASSETS/'baked-lighting';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU'
scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=3;scene.cycles.glossy_bounces=2
scene.render.threads_mode='FIXED';scene.render.threads=2
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.21,.27,.34,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.2

def mat(name,color,metal=0,rough=.65):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1)
    b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
    return m

stone=mat('Proxy gray green stone',(.14,.17,.15))
wood=mat('Proxy dark walnut',(.11,.055,.025),rough=.45)
velvet=mat('Proxy oxblood textile',(.16,.009,.016),rough=.9)
ivory=mat('Proxy ivory',(.72,.68,.57))
gold=mat('Proxy gold',(.55,.32,.095),1,.3)

def box(name,size,position,material):
    x,y,z=position
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,-z,y))
    o=bpy.context.object;o.name=name;o.scale=(size[0],size[2],size[1]);o.data.materials.append(material)
    return o

box('Floor',(40,.3,54),(0,-.2,0),stone)
for x in [-13,13]:box('Side wall',(1,23,52),(x,11,-2),stone)
box('Rear wall',(26,23,1),(0,11,-22),stone)
box('Vault proxy',(26,.4,48),(0,20,-2),stone)
box('Throne backdrop',(8.2,12,.06),(0,7.9,-20.3),velvet)
for x in [-10.5,10.5]:
    for z in [-18,-10,-2,6,14]:box('Pillar proxy',(1.2,14,1.2),(x,7,z),stone)
box('Table body',(12,.55,19),(0,2.7,0),wood)
for x in [-4.9,4.9]:
    for z in [-7.7,7.7]:box('Table leg',(.75,2.5,.75),(x,1.2,z),wood)

def area(name,pos,target,power,color,width,height):
    x,y,z=pos;bpy.ops.object.light_add(type='AREA',location=(x,-z,y))
    o=bpy.context.object;o.name=name;o.data.energy=power;o.data.color=color
    o.data.shape='RECTANGLE';o.data.size=width;o.data.size_y=height
    tx,ty,tz=target;o.rotation_euler=(Vector((tx,-tz,ty))-o.location).to_track_quat('-Z','Y').to_euler()
    return o

# The panoramic probe contains the same three rear windows, not studio light cards.
for x in [-7,0,7]:
    window=mat('Cool window',(.65,.8,1))
    b=window.node_tree.nodes['Principled BSDF'];b.inputs['Emission Color'].default_value=(.65,.8,1,1)
    b.inputs['Emission Strength'].default_value=5
    box('Window',(3.5,11,.02),(x,10,-21.4),window)
    area('Window diffuse', (x,10,-21.3),(0,3,0),850,(.7,.83,1),3.5,11)
area('Soft room bounce',(10,12,5),(0,3,0),350,(.82,.88,1),6,8)
area('Throne wash',(0,13,-12),(0,4,-18.5),220,(1,.73,.43),3,3)
seats=[(-4.75,-5.8),(-4.75,0),(-4.75,5.8),(4.75,-5.8),(4.75,0),(4.75,5.8),(0,-7.8)]

def import_asset(name):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.import_scene.gltf(filepath=str(ASSETS/'blender-tableware'/f'{name}.glb'))
    # The exported models have no animations or armatures; keep mesh world transforms.
    objects=[o for o in bpy.context.selected_objects if o.type=='MESH']
    for o in objects:
        world=o.matrix_world.copy();o.parent=None;o.matrix_world=world
    return objects

for name in ['charger','goblet','napkin']:
    originals=import_asset(name)
    for index,(x,z) in enumerate(seats):
        if name=='charger':pos=(x,3.01,z)
        elif name=='goblet':pos=(x+(.7 if x<0 else -.7),3.02,z-.85)
        else:pos=((-1.18 if x==0 else x+(-.82 if x<0 else .82)),3.05,z+.8)
        for source in originals:
            clone=source.copy();clone.data=source.data;bpy.context.collection.objects.link(clone)
            if name=='napkin':clone.rotation_euler.z=-.25
            clone.location+=Vector((pos[0],-pos[2],pos[1]))
    for o in originals:bpy.data.objects.remove(o,do_unlink=True)

# Candle stands occlude the tabletop; light contribution stays realtime and unbaked.
for x,z in [(-4,-3),(4,-3),(-4,3),(4,3),(2.5,7.8)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.35,depth=.09,location=(x,-z,3.03))
    bpy.context.object.data.materials.append(gold)
    box('Stem proxy',(.14,.85,.14),(x,3.47,z),gold)
    box('Wax proxy',(.20,.52,.20),(x,4.19,z),ivory)

# Panorama at table center; excludes the chart/runner to keep this reusable as lighting.
bpy.ops.object.camera_add(location=(0,0,4.8));camera=bpy.context.object
camera.data.type='PANO';camera.data.panorama_type='EQUIRECTANGULAR'
camera.rotation_euler=Vector((0,1,0)).to_track_quat('-Z','Y').to_euler();scene.camera=camera
scene.render.resolution_x=1024;scene.render.resolution_y=512;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='HDR';scene.render.filepath=str(OUT/'imperial-room-1k.hdr')
bpy.ops.render.render(write_still=True)

# Bake only the tabletop plane. UV v grows with Three world z, just like bevelBox top UVs.
mesh=bpy.data.meshes.new('Table bake UV');mesh.from_pydata([(-6,9.5,2.981),(6,9.5,2.981),(6,-9.5,2.981),(-6,-9.5,2.981)],[],[(3,2,1,0)])
target=bpy.data.objects.new('Table bake receiver',mesh);bpy.context.collection.objects.link(target)
uv=mesh.uv_layers.new(name='UVMap')
coords=[(0,0),(1,0),(1,1),(0,1)]
for loop in mesh.loops:uv.data[loop.index].uv=coords[loop.vertex_index]
bake_mat=mat('Neutral irradiance receiver',(1,1,1),rough=1);mesh.materials.append(bake_mat)
node=bake_mat.node_tree.nodes.new('ShaderNodeTexImage');bake_mat.node_tree.nodes.active=node
bpy.ops.object.select_all(action='DESELECT');target.select_set(True);bpy.context.view_layer.objects.active=target
scene.render.bake.margin=8;scene.render.bake.use_selected_to_active=False
scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_color=False;scene.render.bake.use_pass_indirect=True
for kind,name in [('DIFFUSE','table-indirect'),('AO','table-ao')]:
    image=bpy.data.images.new(name,width=1024,height=1024,float_buffer=True)
    image.colorspace_settings.name='Non-Color';node.image=image
    bpy.ops.object.bake(type=kind)
    # Non-color linear values: Three lightMap/AO also load with NoColorSpace.
    image.filepath_raw=str(OUT/(name+'.png'));image.file_format='PNG';image.save()

manifest=dict(blender=bpy.app.version_string,seconds=round(time.monotonic()-START,2),cpu_threads=2,
    samples=32,panorama=[1024,512],bakes=[1024,1024],probe_three=[0,4.8,0],
    uv='u=x/12+0.5; v=z/19+0.5',indirect_only=True,
    limitations='Static lighting proxy; no moving-object GI, no candle direct light baked; no per-object probe parallax correction.',
    files={p.name:p.stat().st_size for p in OUT.iterdir() if p.suffix in ['.hdr','.png']})
(OUT/'bake-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('BAKE_COMPLETE',json.dumps(manifest))
