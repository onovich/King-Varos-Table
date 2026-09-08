"""Run with Blender --background --factory-startup --threads 2 --python this_file.
Self-authored geometry. Exports reusable glTF assets and a modest CPU proof render.
No downloads, GUI, GPU render, simulations or external add-ons.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'web/prototypes/imperial-table/assets/blender-tableware'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, color, metal=0, rough=.3):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metal
    bsdf.inputs['Roughness'].default_value = rough
    return mat


gold = material('Brushed warm gilt', (.67, .42, .14), 1, .25)
porcelain = material('Ivory glaze', (.78, .74, .62), 0, .19)
porcelain.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value = .38
linen = material('Unbleached linen', (.58, .50, .38), 0, .91)
linen.node_tree.nodes.get('Principled BSDF').inputs['Sheen Weight'].default_value = .45


def surface(name, vertices, faces, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    return obj


def revolve(name, profile, mat, flute=0):
    n = 96
    vertices = []
    for radius, height in profile:
        for i in range(n):
            a = i * math.tau / n
            # Fluting fades at the lip and at the stem; inner surface remains smooth.
            delta = flute * math.sin(16*a) * math.sin(math.pi*min(1,max(0,(height-.48)/.48)))**2
            r = radius + delta if radius > .16 and .5 < height < .96 else radius
            vertices.append((r*math.cos(a), r*math.sin(a), height))
    faces = []
    for j in range(len(profile)-1):
        for i in range(n):
            a = j*n+i; b = j*n+(i+1)%n
            face = (a,b,b+n,a+n)
            faces.append(tuple(reversed(face)) if name == 'Porcelain charger' else face)
    obj = surface(name, vertices, faces, mat)
    sub = obj.modifiers.new('Polished continuous profile', 'SUBSURF')
    sub.levels = 1
    sub.render_levels = 1
    return obj


def torus(name, radius, minor, height, mat):
    bpy.ops.mesh.primitive_torus_add(major_segments=96, minor_segments=8,
        major_radius=radius, minor_radius=minor, location=(0,0,height))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj


def export(name, objects):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(filepath=str(OUT / (name+'.glb')), export_format='GLB',
        use_selection=True, export_apply=True, export_animations=False, export_cameras=False,
        export_lights=False, export_extras=False)


plate = [revolve('Porcelain charger', [(0,.045),(.55,.045),(.62,.048),(.69,.064),(.78,.10),
    (.88,.155),(.97,.196),(1.015,.202),(1.03,.196),(1.028,.181),(.99,.171),(.91,.139),
    (.81,.077),(.72,.032),(.61,.017),(.54,.017),(0,.017)], porcelain),
    torus('Rolled gold lip',1.016,.009,.201,gold), torus('Fine inner gilt',.84,.004,.135,gold)]
export('charger', plate)

goblet = [revolve('Fluted gold cup', [(0,.012),(.22,.012),(.29,.025),(.295,.04),(.275,.059),
    (.19,.069),(.10,.092),(.055,.145),(.044,.23),(.043,.40),(.059,.47),(.14,.51),
    (.22,.57),(.28,.68),(.311,.79),(.317,.90),(.317,.954),(.315,.967),(.301,.969),
    (.298,.953),(.296,.90),(.289,.79),(.258,.69),(.20,.60),(.115,.554),(0,.548)],gold,.009),
    torus('Cup rim',.308,.009,.963,gold),torus('Stem collar',.06,.008,.458,gold)]
export('goblet',goblet)

# A gathered open linen sheet, thickened after smoothing; no block-shaped substitute.
vertices=[];faces=[];nx=32;ny=48
for j in range(ny+1):
    v=j/ny*2-1
    width=.16+.16*abs(v)**.7
    for i in range(nx+1):
        u=i/nx*2-1
        x=u*width
        y=v*.46+.018*math.sin(u*4+v*3)*abs(v)
        phase=u*math.pi*(4+.4*math.sin(v*3))+.6*math.sin(u*5+v*2)
        z=.035+.035*math.cos(u*math.pi/2)+(.010+.018*abs(v))*math.cos(phase)*(1-.5*abs(u))
        z+=.012*math.sin(v*4+u*2)*abs(v)
        vertices.append((x,y,z))
for j in range(ny):
    for i in range(nx):
        a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
cloth=surface('Gathered linen',vertices,faces,linen)
sub=cloth.modifiers.new('Soft woven folds','SUBSURF');sub.levels=1
solid=cloth.modifiers.new('Linen edge thickness','SOLIDIFY');solid.thickness=.004
ring=torus('Oval napkin clasp',.19,.018,0,gold)
ring.rotation_euler=(math.pi/2,0,0);ring.scale=(1,.48,1);ring.location.z=.085
export('napkin',[cloth,ring])

# Exported models stay origin-centered; only the proof-render arrangement is moved.
for obj in plate: obj.location.x=-.35
for obj in goblet: obj.location.x=.55;obj.location.y=.75
for obj in [cloth,ring]: obj.location.x+=1.12;obj.location.y-=.40
tablemat=material('Proof stage dark walnut',(.055,.027,.016),0,.34)
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,-.10))
stage=bpy.context.object;stage.scale=(200,200,.2);stage.data.materials.append(tablemat)
world=bpy.context.scene.world;world.use_nodes=True
world.node_tree.nodes.get('Background').inputs[0].default_value=(.17,.20,.24,1)
world.node_tree.nodes.get('Background').inputs[1].default_value=.35
for position,power,color,size in [((-3,-2,5),500,(1,.83,.62),4),((2,3,4),650,(.65,.8,1),3)]:
    bpy.ops.object.light_add(type='AREA',location=position)
    light=bpy.context.object;light.data.energy=power;light.data.color=color;light.data.shape='DISK';light.data.size=size
    light.rotation_euler=(Vector((0,0,.3))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(3.1,-4.8,4.0))
camera=bpy.context.object;camera.rotation_euler=(Vector((.25,.05,.25))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=3.6
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.device='CPU'
scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.threads_mode='FIXED';scene.render.threads=2
scene.render.resolution_x=900;scene.render.resolution_y=700;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=90;scene.render.filepath=str(OUT/'proof.jpg')
bpy.ops.render.render(write_still=True)
print('TABLEWARE_DONE',[(p.name,p.stat().st_size) for p in OUT.iterdir()])
