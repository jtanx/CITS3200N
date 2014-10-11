import re

def filenameify(s, space_repr=None):
    #Remove characters that are not allowed from a file name
    if space_repr: 
        s = re.sub(r'\s', space_repr, s)
    return re.sub(r'[/\\\?%*:|"<>]', '', s).strip()