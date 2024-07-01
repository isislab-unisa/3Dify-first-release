using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Test : MonoBehaviour
{
    public PreviewManager Preview;
    public string Endpoint;
    public string BucketName;

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
