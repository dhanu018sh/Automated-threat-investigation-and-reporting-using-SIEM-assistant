import pptx
from pptx.util import Inches, Pt
from pptx.oxml import parse_xml

pptx_path = r"D:\antigravity\scratch\siem-assistant\Automated_Threat_Investigation_SIEM_Assistant_Phase_2_Presentation.pptx"
prs = pptx.Presentation(pptx_path)

s14 = prs.slides[13] # Slide 14 (0-indexed 13)

# 1. Add Outer Border Rectangle (Rectangle 7)
rect7_xml = """
<p:sp xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:nvSpPr>
    <p:cNvPr id="888" name="Rectangle 7"/>
    <p:cNvSpPr/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm>
      <a:off x="18010" y="0"/>
      <a:ext cx="12173990" cy="6858000"/>
    </a:xfrm>
    <a:prstGeom prst="rect">
      <a:avLst/>
    </a:prstGeom>
    <a:noFill/>
    <a:ln w="73025" cmpd="sng"/>
  </p:spPr>
  <p:style>
    <a:lnRef idx="2">
      <a:schemeClr val="accent1">
        <a:shade val="50000"/>
      </a:schemeClr>
    </a:lnRef>
    <a:fillRef idx="1">
      <a:schemeClr val="accent1"/>
    </a:fillRef>
    <a:effectRef idx="0">
      <a:schemeClr val="accent1"/>
    </a:effectRef>
    <a:fontRef idx="minor">
      <a:schemeClr val="lt1"/>
    </a:fontRef>
  </p:style>
  <p:txBody>
    <a:bodyPr rtlCol="0" anchor="ctr"/>
    <a:lstStyle/>
    <a:p>
      <a:pPr algn="ctr"/>
      <a:endParaRPr lang="en-IN"/>
    </a:p>
  </p:txBody>
</p:sp>
"""

new_sp = parse_xml(rect7_xml)
# Insert at index 0 of spTree so it is in the background
s14._element.spTree.insert(2, new_sp)
print("Inserted outer border (Rectangle 7) into Slide 14.")

# 2. Add border to Title on Slide 14
# Match Title 10 from other slides: left=1599460, top=112525, width=9358840, height=896145
t14 = s14.shapes.title
if t14:
    t14.left = 1599460
    t14.top = 112525
    t14.width = 9358840
    t14.height = 896145
    # Add border line to title spPr
    spPr = t14._element.spPr
    # check if ln already in spPr
    ln = spPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}ln')
    if ln is not None:
        spPr.remove(ln)
    title_ln_xml = """
    <a:ln xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" w="34925" cmpd="sng">
      <a:solidFill>
        <a:schemeClr val="accent1">
          <a:shade val="50000"/>
        </a:schemeClr>
      </a:solidFill>
    </a:ln>
    """
    spPr.append(parse_xml(title_ln_xml))
    print("Added title border to Slide 14.")

# 3. Add Slide Number at bottom right if missing
has_slide_num = any(sh.name.startswith("Slide Number") for sh in s14.shapes)
if not has_slide_num:
    sn_xml = """
    <p:sp xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
      <p:nvSpPr>
        <p:cNvPr id="889" name="Slide Number Placeholder 1"/>
        <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
        <p:nvPr><p:ph type="sldNum" sz="quarter" idx="1"/></p:nvPr>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="8610600" y="6356350"/>
          <a:ext cx="2743200" cy="365125"/>
        </a:xfrm>
      </p:spPr>
      <p:txBody>
        <a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0" anchor="ctr"/>
        <a:lstStyle/>
        <a:p>
          <a:pPr algn="r"/>
          <a:r>
            <a:rPr lang="en-US" smtClean="0"/>
            <a:t>14</a:t>
          </a:r>
        </a:p>
      </p:txBody>
    </p:sp>
    """
    s14._element.spTree.append(parse_xml(sn_xml))
    print("Added slide number 14 placeholder.")

# 4. Reposition KSIT logo to exact position
for sh in s14.shapes:
    if sh.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE:
        sh.left = 442155
        sh.top = 29413
        sh.width = 761065
        sh.height = 871364
        print("Repositioned KSIT logo on Slide 14.")

prs.save(pptx_path)
print("Saved presentation with Slide 14 border:", pptx_path)
