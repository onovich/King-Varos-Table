"""Background Blender: joined timber chairs, independent throne and scored round bread.
Shared geometry, baked procedural crust. No external assets or textures.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

OUT=Path(__file__).resolve().parents[1]/'web/prototypes/imperial-table/assets/blender-furniture'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def mat(name,color,metal,rough):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
 p=m.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
wood=mat('Carved walnut',(.055,.027,.014),0,.37)
gold=mat('Restrained gilt inlay',(.46,.28,.10),1,.32)
ivory=mat('Carved ivory panels',(.67,.52,.31),0,.48)
fabric=mat('Oxblood upholstery',(.11,.009,.02),0,.8)
fabric.node_tree.nodes['Principled BSDF'].inputs['Sheen Weight'].default_value=.16

def tube(name,points,radius,material,closed=False):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=8;curve.bevel_depth=radius;curve.bevel_resolution=3
 spline=curve.splines.new('BEZIER');spline.bezier_points.add(len(points)-1)
 for p,xyz in zip(spline.bezier_points,points):p.co=xyz;p.handle_left_type=p.handle_right_type='VECTOR' if closed else 'AUTO'
 spline.use_cyclic_u=closed
 o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o);o.data.materials.append(material)
 return o

def box(name,loc,scale,material,bevel=.07):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if material==wood:
  uv=o.data.uv_layers.active
  for face in o.data.polygons:
   normal_axis=max(range(3),key=lambda i:abs(face.normal[i]))
   axes=[i for i in range(3) if i!=normal_axis];long_axis=max(axes,key=lambda i:scale[i]);short_axis=next(i for i in axes if i!=long_axis)
   for li in face.loop_indices:
    co=o.data.vertices[o.data.loops[li].vertex_index].co
    uv.data[li].uv=(co[long_axis]*.65+.5,co[short_axis]*1.8+.5)
 o.data.materials.append(material);mod=o.modifiers.new('Soft machined edges','BEVEL');mod.width=bevel;mod.segments=3
 mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return o


def export(name):
 bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=next(iter(bpy.context.selected_objects));bpy.ops.object.convert(target='MESH')
 for material in [wood,gold,fabric,ivory]:
  bpy.ops.object.select_all(action='DESELECT');objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==material]
  if not objects: continue
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name=material.name
 bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=str(OUT/name),export_format='GLB',use_selection=True,export_apply=True,export_animations=False)
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def turned_post(name,x,y,height,royal=False):
 # Turned collars belong to one continuous timber shaft; no detached rings.
 profile=[(0,.105),(.08,.115),(.19,.115),(.25,.088),(.55,.084),(.62,.104),(.69,.088),(1.37,.09),(1.44,.115),(1.70,.115),(1.77,.092),(height-.24,.085),(height-.19,.113),(height-.08,.113),(height,.077)]
 vertices=[];faces=[];n=16
 for z,r in profile:
  for i in range(n):
   a=i*math.tau/n;vertices.append((x+math.cos(a)*r,y+math.sin(a)*r,z))
 for j in range(len(profile)-1):
  for i in range(n):
   a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
 faces.extend([tuple(reversed(range(n))),tuple((len(profile)-1)*n+i for i in range(n))])
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
 o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(wood)
 for f in mesh.polygons:f.use_smooth=True
 # UVs keep grain running along the length of the shaft.
 uv=mesh.uv_layers.new()
 for f in mesh.polygons:
  for li in f.loop_indices:
   v=mesh.loops[li].vertex_index;uv.data[li].uv=((v//n)/(len(profile)-1)*2,(v%n)/n)
 box('Close fitting bronze foot', (x,y,.09),(.224,.224,.16),gold,.018)

def cushion(w,d):
 box('Linen covered loose cushion',(0,-.035,1.81),(w*2-.16,d*2-.12,.23),fabric,.10)
 tube('Sewn cushion welt',[(-w+.12,-d+.12,1.80),(w-.12,-d+.12,1.80),(w-.12,d-.14,1.80),(-w+.12,d-.14,1.80)],.012,fabric,True)

def frame_panel(w,low,high,y,royal=False):
 # Real framed panel with a setback field and two nested moulding steps.
 box('Recessed walnut field',(0,y+.028,(low+high)/2),(w*2-.25,.105,high-low),wood,.014)
 for x in [-w+.085,w-.085]:
  box('Raised panel stile',(x,y-.025,(low+high)/2),(.15,.18,high-low+.16),wood,.024)
  box('Inner carved bead',(x+(.085 if x<0 else -.085),y-.085,(low+high)/2),(.035,.035,high-low-.08),wood,.012)
 for z in [low,high]:
  box('Mortised back rail',(0,y-.018,z),(w*2,.20,.16),wood,.025)
  box('Inner horizontal bead',(0,y-.082,z+(.09 if z==low else -.09)),(w*2-.26,.035,.035),wood,.012)
 # Small bronze pins at structural joints, not decorative shapes across the field.
 for x in [-w+.085,w-.085]:
  for z in [low,high]:
   bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,location=(x,y-.12,z));o=bpy.context.object;o.name='Flush bronze fixing';o.scale=(.026,.012,.026);o.data.materials.append(gold)
 # A textile-covered inset gives the guests a courtly upholstered back, with timber margins.
 textile_top=high-.90 if royal else high-.34
 box('Woven back cushion',(0,y-.053,(low+.25+textile_top)/2),(w*2-.52,.055,textile_top-low-.25),fabric,.024)
 if royal:
  # An integrated upper ivory frieze, divided into five small palmettes, not an applied badge.
  cz=high-.44
  box('Ivory carved frieze',(0,y-.070,cz),(w*2-.35,.034,.48),ivory,.013)
  for z in [cz-.28,cz+.28]:box('Frieze gilt fillet',(0,y-.080,z),(w*2-.26,.025,.028),gold,.005)
  for center in [-.78,-.39,0,.39,.78]:
   for i in range(-2,3):
    angle=i*.31
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,location=(center+math.sin(angle)*.08,y-.101,cz+math.cos(angle)*.025))
    o=bpy.context.object;o.name='Ivory palmette low relief';o.scale=(.024,.012,.14);o.rotation_euler.y=angle;o.data.materials.append(ivory)
  for x in [-w+.17,w-.17]:box('Imperial narrow gilt stile',(x,y-.125,(low+high)/2),(.027,.016,high-low-.10),gold,.005)

def chair(royal=False):
 w=1.24 if royal else 1.08;d=1.00;top=5.70 if royal else 4.55
 for x in [-w,w]:
  for y in [-d,d]:turned_post('Continuous turned walnut upright',x,y,top if y>0 else 2.47,royal)
  box('Joined side stretcher',(x,0,.55),(.105,d*2,.12),wood,.018)
  box('Mortised side apron',(x,0,1.48),(.17,d*2,.29),wood,.023)
  box('Rounded solid arm',(x,-.025,2.42),(.24,d*2+.16,.13),wood,.05)
  if royal:
   box('Solid imperial arm field',(x,0,2.02),(.105,1.72,.60),wood,.014)
   for z in [1.77,2.27]:box('Arm field moulding',(x,0,z),(.15,1.76,.04),wood,.01)
 for y in [-d,d]:
  box('Joined seat apron',(0,y,1.48),(w*2,.17,.29),wood,.023)
  box('Apron moulded lip',(0,y,1.61),(w*2,.195,.045),wood,.011)
 box('Solid seat boards',(0,0,1.65),(w*2,d*2,.14),wood,.023)
 cushion(w,d)
 frame_panel(w,2.20,top-.20,d,royal)
 if royal:
  box('Imperial stepped crest',(0,d,top-.02),(w*2+.34,.28,.17),wood,.03)
  box('Crest upper moulding',(0,d,top+.09),(w*2+.42,.31,.065),wood,.018)
  box('Narrow bronze crest lip',(0,d-.16,top+.065),(w*2+.20,.016,.025),gold,.006)
chair();export('imperial-chair.glb')
chair(True);export('imperial-throne.glb')
# Eight scored segments form a classical round loaf. Uneven crust is geometry.
bread=mat('Baked wheat crust',(.48,.20,.052),0,.86)
for k in range(8):
 a=k*math.tau/8
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=(math.cos(a)*.29,math.sin(a)*.29,.17))
 o=bpy.context.object;o.name='Scored round loaf';o.scale=(.37,.26,.18);o.rotation_euler.z=a
 for v in o.data.vertices:
  v.co*=1+.012*math.sin(v.co.x*41+v.co.y*23)*math.sin(v.co.z*37)
 o.data.materials.append(bread)
 for face in o.data.polygons:face.use_smooth=True
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=bpy.context.selected_objects[0];bpy.ops.object.join()
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.015);bpy.ops.object.mode_set(mode='OBJECT')
nodes=bread.node_tree.nodes;links=bread.node_tree.links;p=nodes['Principled BSDF']
noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=16;noise.inputs['Detail'].default_value=4
ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.22;ramp.color_ramp.elements[0].color=(.075,.014,.003,1);ramp.color_ramp.elements[1].position=.76;ramp.color_ramp.elements[1].color=(.72,.43,.15,1)
links.new(noise.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs[0],p.inputs['Base Color'])
image=bpy.data.images.new('Baked flour and crust',width=512,height=512);node=nodes.new('ShaderNodeTexImage');node.image=image;nodes.active=node
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=8;scene.render.threads_mode='FIXED';scene.render.threads=2
scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=False;scene.render.bake.use_pass_color=True
bpy.ops.object.bake(type='DIFFUSE');links.new(node.outputs['Color'],p.inputs['Base Color']);image.pack()
export('round-bread.glb')
print('FURNITURE_COMPLETE')
