using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Networking;

public class ProxyResponse
{
    public string code;
    public string status;
    public string error;
    public string message;
}

public class PythonRequest
{
    public string imageBase64;
    public string gender;
    public float age;
}

public class GenderAgeRequest
{
    public string img;
    public int width;
}

public class GenderAgeResponse
{
    public string code;
    public string status;
    public string error;
    public GenderAgeResponseMetadata message;
}

public class GenderAgeResponseMetadata
{
    public string gender;
    public float age;
}

public class ExportFbxResponse
{
    public Dictionary<string, string> sliders;
    public string landmarks;
    public string normalizedLandmarks;
    public string zipFile64;
}

public class Client3dify : MonoBehaviour
{
    public string ServerEndpoint;
    public string PythonEndpoint;
    public string ApplyModifiersApi;
    public string ExportFbxApi;
    public string ExtractFeaturesApi;
    public string GenderAgeApi;
    public string MinioProxyApi;
    public string BucketName;
    public string ImageFileName;
    public string ParametersFileName;
    public string FbxFileName;

    public string GetFileEndpoint(string fileName)
    {
        return ServerEndpoint + MinioProxyApi + $"?bucket={BucketName}&filename={fileName}";
    }
    
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
                case UnityWebRequest.Result.ProtocolError:
                    Debug.LogError(pages[page] + ": Error: " + webRequest.error);
                    break;
                case UnityWebRequest.Result.Success:
                    Debug.Log(pages[page] + ":\n Success ");
                    callback.Invoke(webRequest.downloadHandler.text);
                    break;
            }
        }
    }
    void PostRequest(string uri, string json, UnityAction<string> callback)
    {
        StartCoroutine(PostRequest_Unity(uri, json, callback));
    }
    
    IEnumerator PostRequest_Unity(string uri, string json, UnityAction<string> callback)
    {
        Debug.Log("POST " + uri);
        using (UnityWebRequest webRequest = UnityWebRequest.Post(uri, json, "application/json"))
        {
            webRequest.SetRequestHeader("Accept", "*/*");
            // Request and wait for the desired page.
            yield return webRequest.SendWebRequest();

            string[] pages = uri.Split('/');
            int page = pages.Length - 1;

            switch (webRequest.result)
            {
                case UnityWebRequest.Result.ConnectionError:
                case UnityWebRequest.Result.DataProcessingError:
                case UnityWebRequest.Result.ProtocolError:
                    Debug.LogError(pages[page] + ": Error: " + webRequest.error);
                    break;
                case UnityWebRequest.Result.Success:
                    Debug.Log(pages[page] + ":\n Success ");
                    callback.Invoke(webRequest.downloadHandler.text);
                    break;
            }
        }
    }

    public void DoApplyModifiers(Dictionary<string, string> parameters, UnityAction callback)
    {
        foreach (var key in parameters.Keys.ToList())
        {
            parameters[key] = parameters[key].Replace(",", ".");
        }
        string paramsJson = JsonConvert.SerializeObject(parameters, Formatting.None);
        Dictionary<string, string> postParams = new Dictionary<string, string>();
        postParams["text"] = paramsJson.Replace("\"", "'");
        PostRequest(ServerEndpoint + ApplyModifiersApi, JsonConvert.SerializeObject(postParams), _ =>
        {
            callback.Invoke();
        });
    }

    public void DoGetParameters(UnityAction<Dictionary<string, string>> callback)
    {
        StartCoroutine(GetRequest(GetFileEndpoint(ParametersFileName), responseStr =>
        {
            ProxyResponse response = JsonConvert.DeserializeObject<ProxyResponse>(responseStr);
            byte[] binary = Convert.FromBase64String(response.message);
            string json = Encoding.ASCII.GetString(binary);
            Dictionary<string, string> parameters = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
            callback.Invoke(parameters);
        }));
    }

    public void DoExtractGenderAndAge(string imageBase64, int imageWidth, UnityAction<GenderAgeResponse> callback)
    {
        GenderAgeRequest request = new GenderAgeRequest()
        {
            img = imageBase64,
            width = imageWidth
        };
        PostRequest(ServerEndpoint + GenderAgeApi, JsonConvert.SerializeObject(request), responseStr =>
        {
            Debug.Log("GenderAge response: " + responseStr);
            
            GenderAgeResponse response = JsonConvert.DeserializeObject<GenderAgeResponse>(responseStr);
            callback.Invoke(response);
        });
    }

    public void DoExtractParameters(string imageBase64, string gender, float age, UnityAction<Dictionary<string, string>> callback)
    {
        PythonRequest req = new PythonRequest();
        req.gender = gender;
        req.imageBase64 = imageBase64;
        req.age = age;
        PostRequest(PythonEndpoint + ExtractFeaturesApi, JsonConvert.SerializeObject(req), responseStr =>
        {
            ExportFbxResponse response = JsonConvert.DeserializeObject<ExportFbxResponse>(responseStr);
            StringBuilder extractedSliders = new StringBuilder(1024);
            foreach (KeyValuePair<string, string> curSlider in response.sliders)
            {
                extractedSliders.AppendFormat("{0} {1}\n", curSlider.Key, curSlider.Value);
            }
            Debug.Log(extractedSliders.ToString());
            callback.Invoke(response.sliders);
        });
        
    }

    public void ExportFbxFromMakehuman(UnityAction<string> callback)
    {
        PythonRequest fakeReq = new PythonRequest();
        fakeReq.gender = string.Empty;
        fakeReq.imageBase64 = string.Empty;
        fakeReq.age = 0f;
        StartCoroutine(GetRequest(PythonEndpoint + ExportFbxApi, responseStr =>
        {
            ExportFbxResponse response = JsonConvert.DeserializeObject<ExportFbxResponse>(responseStr);
            callback.Invoke(response.zipFile64);
        }));
    }
    
    public void DoGetFbx(UnityAction<string> callback)
    {
        StartCoroutine(GetRequest(GetFileEndpoint(FbxFileName), responseStr =>
        {
            ProxyResponse response = JsonConvert.DeserializeObject<ProxyResponse>(responseStr);
            callback.Invoke(response.message);
        }));
    }
   
    public void DoUploadFbx(string fbx, UnityAction callback)
    {
        Dictionary<string, string> req = new Dictionary<string, string>();
        req["bucket"] = BucketName;
        req["file"] = FbxFileName;
        req["fileContent64"] = fbx;
        req["fileType"] = "application/blob";
        PostRequest(GetFileEndpoint(FbxFileName), JsonConvert.SerializeObject(req), _ =>
        {
            Debug.Log("Upload successful");
            callback.Invoke();
        });
    }
    
    public void DoUploadParameters(Dictionary<string, string> parameters, UnityAction callback)
    {
        string json = JsonConvert.SerializeObject(parameters);
        byte[] jsonBinary = Encoding.ASCII.GetBytes(json);
        Dictionary<string, string> req = new Dictionary<string, string>();
        req["bucket"] = BucketName;
        req["file"] = ParametersFileName;
        req["fileContent64"] = Convert.ToBase64String(jsonBinary);
        req["fileType"] = "application/blob";
        PostRequest(GetFileEndpoint(ParametersFileName), JsonConvert.SerializeObject(req), _ =>
        {
            Debug.Log("Upload successful");
            callback.Invoke();
        });
    }
    
    public void DoGetImage(string filename, UnityAction<Texture2D> callback)
    {
        StartCoroutine(GetRequest(GetFileEndpoint(filename), responseStr =>
        {
            Texture2D texture = new Texture2D(2, 2);
            ProxyResponse response = JsonConvert.DeserializeObject<ProxyResponse>(responseStr);
            byte[] binary = Convert.FromBase64String(response.message);
            texture.LoadImage(binary);
            callback.Invoke(texture);
        }));
    }

}
