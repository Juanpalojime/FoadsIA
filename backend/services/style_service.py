
import json

class StyleService:
    def __init__(self):
        # Database of Styles extracted from Fooocus
        self.styles = {
            "Fooocus V2": {
                "name": "Fooocus V2",
                "prompt": "(masterpiece), (best quality), (ultra-detailed), {prompt}, illustration, disheveled hair, detailed eyes, perfect composition, moist skin, intricate details, earrings",
                "negative_prompt": "longbody, lowres, bad anatomy, bad hands, missing fingers, pubic hair,extra digit, fewer digits, cropped, worst quality, low quality"
            },
            "Fooocus Cinematic": {
                "name": "Fooocus Cinematic",
                "prompt": "cinematic still {prompt} . emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
                "negative_prompt": "anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured"
            },
            "Fooocus Photograph": {
                "name": "Fooocus Photograph",
                "prompt": "photograph {prompt}, 50mm . cinematic 4k epic detailed 4k epic detailed photograph shot on kodak detailed cinematic hbo dark moody, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage",
                "negative_prompt": "Brad Pitt, bokeh, depth of field, blurry, cropped, regular face, saturated, contrast, deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime, text, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck"
            },
            "SAI Anime": {
                "name": "SAI Anime",
                "prompt": "anime artwork {prompt} . anime style, key visual, vibrant, studio anime,  highly detailed",
                "negative_prompt": "photo, deformed, black and white, realism, disfigured, low contrast"
            },
            "SAI 3D Model": {
                "name": "SAI 3D Model",
                "prompt": "professional 3d model {prompt} . octane render, highly detailed, volumetric, dramatic lighting",
                "negative_prompt": "ugly, deformed, noisy, low poly, blurry, painting"
            },
             "MRE Cinematic Dynamic": {
                "name": "MRE Cinematic Dynamic",
                "prompt": "epic cinematic shot of {prompt}, deep depth of field, 35mm crisp, bright colors, volumetric lighting, highly detailed, sharp",
                "negative_prompt": "render, illustration, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"
            },
            "None": {
                "name": "None",
                "prompt": "{prompt}",
                "negative_prompt": ""
            }
        }

    def get_styles(self):
        """Returns a list of available style names."""
        return list(self.styles.keys())

    def apply_style(self, style_name, user_prompt, negative_prompt=""):
        """
        Applies a style to a user prompt.
        Returns: (positive_prompt, negative_prompt)
        """
        style = self.styles.get(style_name)
        
        # Fallback if style not found
        if not style:
            return user_prompt, negative_prompt

        # Apply Positive Prompt
        style_prompt = style.get("prompt", "{prompt}")
        final_positive = style_prompt.replace("{prompt}", user_prompt)
        
        # Apply Negative Prompt (Concatenate)
        style_negative = style.get("negative_prompt", "")
        final_negative = f"{style_negative}, {negative_prompt}".strip(", ")
        
        return final_positive, final_negative

# Singleton
_style_service = None

def get_style_service():
    global _style_service
    if _style_service is None:
        _style_service = StyleService()
    return _style_service
