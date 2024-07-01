using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;

public class Test : MonoBehaviour
{
    public PreviewManager Preview;
    public string Endpoint;
    public string BucketName;
    
    public static string[] GetArguments()
    {
#if (UNITY_WEBGL || UNITY_ANDROID) && !UNITY_EDITOR
        // url with parameters syntax : http://example.com?arg1=value1&arg2=value2
        if (Application.absoluteURL.Contains("localhost"))
        {
            string parameters = Application.absoluteURL.Substring(Application.absoluteURL.IndexOf("?")+1);
            return parameters.Split(new char[] { '&', '=' });
        }
        else 
            return new string[] { };
#else
        return Environment.GetCommandLineArgs();
#endif
    }

    private void Start()
    {
#if (UNITY_WEBGL || UNITY_ANDROID) && !UNITY_EDITOR
        string[] args = GetArguments();
        int idParamIndex = Array.IndexOf(args, "id");
        if (idParamIndex == -1 || idParamIndex >= args.Length - 1)
        {
            Debug.LogError("Invalid bucket id in the url");
            return;
        }
        Preview.Init(Endpoint, args[idParamIndex + 1]);
#endif
    }

    [ContextMenu("Init")]
    void Init()
    {
        Preview.Init(Endpoint, BucketName);
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.F))
        {
            Init();
        }
    }
}
