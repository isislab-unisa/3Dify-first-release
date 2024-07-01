using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using TriLibCore;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Networking;
using Newtonsoft.Json;

public class MinioProxyTest : MonoBehaviour
{
    public string Endpoint;
    public string BucketName;
    public string FileName;
    public KeyCode GetFileKey;
    public AssetLoaderOptions Options;
    public Vector3 StartPos;
    public Vector3 StartRot;
    
    IEnumerator GetRequest(string uri, UnityAction<string> callback)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(uri))
        {
            // Request and wait for the desired page.
            yield return webRequest.SendWebRequest();

            string[] pages = uri.Split('/');
            int page = pages.Length - 1;

            switch (webRequest.result)
            {
                case UnityWebRequest.Result.ConnectionError:
                case UnityWebRequest.Result.DataProcessingError:
                    Debug.LogError(pages[page] + ": Error: " + webRequest.error);
                    break;
                case UnityWebRequest.Result.ProtocolError:
                    Debug.LogError(pages[page] + ": HTTP Error: " + webRequest.error);
                    break;
                case UnityWebRequest.Result.Success:
                    Debug.Log(pages[page] + ":\n Success ");
                    callback.Invoke(webRequest.downloadHandler.text);
                    break;
            }
        }
    }

    void OnFbxReceived(string base64Fbx)
    {
	    ProxyResponse response = JsonConvert.DeserializeObject<ProxyResponse>(base64Fbx);
        byte[] binaryFbx = Convert.FromBase64String(response.message);
        AssetLoaderZip.LoadModelFromZipStream(new MemoryStream(binaryFbx), OnLoad, OnMaterialsLoad, OnProgress,
	        OnError, null, Options);
    }
    
    // This event is called when the model is about to be loaded.
	// You can use this event to do some loading preparation, like showing a loading screen in platforms without threading support.
	// This event receives a Boolean indicating if any file has been selected on the file-picker dialog.
	private void OnBeginLoad(bool anyModelSelected)
	{

	}

	// This event is called when the model loading progress changes.
	// You can use this event to update a loading progress-bar, for instance.
	// The "progress" value comes as a normalized float (goes from 0 to 1).
	// Platforms like UWP and WebGL don't call this method at this moment, since they don't use threads.
	private void OnProgress(AssetLoaderContext assetLoaderContext, float progress)
	{

	}

	// This event is called when there is any critical error loading your model.
	// You can use this to show a message to the user.
	private void OnError(IContextualizedError contextualizedError)
	{

	}

	// This event is called when all model GameObjects and Meshes have been loaded.
	// There may still Materials and Textures processing at this stage.
	private void OnLoad(AssetLoaderContext assetLoaderContext)
	{
		// The root loaded GameObject is assigned to the "assetLoaderContext.RootGameObject" field.
		// If you want to make sure the GameObject will be visible only when all Materials and Textures have been loaded, you can disable it at this step.
		var myLoadedGameObject = assetLoaderContext.RootGameObject;
		myLoadedGameObject.SetActive(false);
	}

	// This event is called after OnLoad when all Materials and Textures have been loaded.
	// This event is also called after a critical loading error, so you can clean up any resource you want to.
	private void OnMaterialsLoad(AssetLoaderContext assetLoaderContext)
	{
		// The root loaded GameObject is assigned to the "assetLoaderContext.RootGameObject" field.
		// You can make the GameObject visible again at this step if you prefer to.
		var myLoadedGameObject = assetLoaderContext.RootGameObject;
		myLoadedGameObject.SetActive(true);
		myLoadedGameObject.transform.position = StartPos;
		myLoadedGameObject.transform.eulerAngles = StartRot;
	}

    private void Update()
    {
        if (Input.GetKeyDown(GetFileKey))
        {
            string url = Endpoint + $"?bucket={BucketName}&filename={FileName}";
            StartCoroutine(GetRequest(url, OnFbxReceived));
        }
    }

    private void OnGUI()
    {
	    if(GUI.Button(new Rect(10f, 10f, 200f, 40f), "Test GetModel"))
	    {
		    string url = Endpoint + $"?bucket={BucketName}&filename={FileName}";
		    StartCoroutine(GetRequest(url, OnFbxReceived));
	    }
    }
}
