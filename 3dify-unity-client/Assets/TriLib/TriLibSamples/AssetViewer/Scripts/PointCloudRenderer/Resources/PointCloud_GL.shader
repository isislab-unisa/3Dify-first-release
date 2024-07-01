Shader "Hidden/PointCloud_GL"
{
    Properties
    {
        _PointSize("PointSize", Float) = 5
        _HeightTex("Height Texture", 2D) = "white" {}
    }

    SubShader
    {
        Pass
        {
            LOD 200

            GLSLPROGRAM
            #pragma multi_compile __ HEIGHTMAP_ON

            #ifdef VERTEX

            out vec4 Color;
            uniform sampler2D _HeightTex;
            uniform float _PointSize;

            float ToneMap(float rawValue)
            {
                float contrast = 3.8;
                float exposure = 0.001;
                float a = exposure * pow(rawValue, contrast);
                return a / (1.0f + a);
            }

            void main()
            {
                gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
                gl_PointSize = _PointSize * (1.0 / gl_Position.w);

                #ifdef HEIGHTMAP_ON
                float index = ToneMap(gl_MultiTexCoord0.x);
                Color = texture2D(_HeightTex, vec2(index, 0));
                #else
                Color = gl_Color;
                #endif
            }

            #endif

            #ifdef FRAGMENT

            in vec4 Color;

            void main()
            {
                vec2 coord = gl_PointCoord - vec2(0.5);
                if (length(coord) > 0.5)
                {
                    discard;
                }

                gl_FragColor = Color;
            }

            #endif

            ENDGLSL
        }
    }
    Fallback "VertexLit"
}