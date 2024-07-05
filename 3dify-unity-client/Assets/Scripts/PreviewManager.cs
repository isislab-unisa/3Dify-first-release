using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using Newtonsoft.Json;
using TriLibCore;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Serialization;
using UnityEngine.UI;

public class PreviewManager : MonoBehaviour
{
    public Client3dify Client;
    public SlidersManager Sliders;
    public AssetLoaderOptions Options;    
    public Vector3 StartPosMale;
    public Vector3 StartPosFemale;
    public Vector3 StartRot;
    public Image InputImage;
    public List<string> MaterialsToMakeFade;
    [FormerlySerializedAs("AnimatorController")] public RuntimeAnimatorController MaleAnimatorController;
    public RuntimeAnimatorController FemaleAnimatorController;
    public List<string> ParametersToAdd;
    public List<string> ParametersToAddValues;
    public List<string> ParametersToRemove;
    public string GenderParameterName;
    public bool IsMale;
    public GameObject LoadingScreen;
    public float ApplyAndDownloadRetryDelay;
    public UIHandler BuildButton;
    private GameObject avatar;
    private string lastAvatarBase64;
    
    [DllImport("__Internal")]
    public static extern void DownloadFileBrowser(byte[] array, int byteLength, string fileName);

    private void Awake()
    {
        LoadingScreen.SetActive(false);
    }

    // To be called from js
    public void Init(string endpoint, string bucketName, string fileName)
    {
        LoadingScreen.SetActive(true);
        avatar = null;
        Client.ServerEndpoint = endpoint;
        Client.BucketName = bucketName;
        Client.DoGetImage(fileName, tex =>
        {
            Sprite image = Sprite.Create(tex, new Rect(0f, 0f, tex.width, tex.height), new Vector2(0.5f, 0.5f), 100f);
            InputImage.sprite = image;
            float newWidth = 100f * ((float)tex.width / tex.height);
            InputImage.rectTransform.sizeDelta = new Vector2(newWidth, 100f);
            string base64Image = Convert.ToBase64String(tex.EncodeToJPG());
            Client.DoExtractGenderAndAge(base64Image, tex.width, genderAndAge =>
            {
                Client.DoExtractParameters(base64Image, genderAndAge.message.gender, genderAndAge.message.age, par =>
                {
                    Sliders.ApplyParametersToSlidersAndChoices(par);
                    Build(par);
                });
            });
        });
    }
    
    private void OnLoad(AssetLoaderContext assetLoaderContext)
    {
        var myLoadedGameObject = assetLoaderContext.RootGameObject;
        myLoadedGameObject.SetActive(false);
    }

    private void OnMaterialsLoad(AssetLoaderContext assetLoaderContext)
    {
        if (avatar != null)
        {
            Destroy(avatar);
        }
        avatar = assetLoaderContext.RootGameObject;
        avatar.SetActive(true);
        avatar.transform.position = IsMale ? StartPosMale : StartPosFemale;
        avatar.transform.eulerAngles = StartRot;
        List<Material> materialsToFade = avatar.GetComponentsInChildren<Renderer>()
            .Where(r => MaterialsToMakeFade.FirstOrDefault(m => r.material.name.ToLower().StartsWith(m)) != null)
            .Select(r => r.material).ToList();
        foreach (Material curMaterial in materialsToFade)
        {
            curMaterial.SetOverrideTag("RenderType", "Transparent");
            curMaterial.SetFloat("_SrcBlend", (float) UnityEngine.Rendering.BlendMode.SrcAlpha);
            curMaterial.SetFloat("_DstBlend", (float) UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            curMaterial.SetFloat("_ZWrite", 0f);
            curMaterial.DisableKeyword("_ALPHATEST_ON");
            curMaterial.EnableKeyword("_ALPHABLEND_ON");
            curMaterial.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            curMaterial.renderQueue = (int) UnityEngine.Rendering.RenderQueue.Transparent;
        }

        Animator animator = avatar.AddComponent<Animator>();
        animator.runtimeAnimatorController = IsMale ? MaleAnimatorController : FemaleAnimatorController;
        LoadingScreen.SetActive(false);
        BuildButton.ChangeImageColor(0);
        BuildButton.ChangeTextColor(0);
    }

    void OnFbxGot(string base64Fbx)
    {
        lastAvatarBase64 = base64Fbx;
        byte[] binaryFbx = Convert.FromBase64String(base64Fbx);
        AssetLoaderZip.LoadModelFromZipStream(new MemoryStream(binaryFbx), OnLoad, OnMaterialsLoad, null,
            null, null, Options);
    }
    
    public void GetFbx(UnityAction<string> callback)
    {
        Client.DoGetFbx(callback);
    }

    void LogParameters(Dictionary<string, string> parameters)
    {
        Debug.Log(JsonConvert.SerializeObject(parameters, Formatting.Indented));
    }

    public void BuildFromSliders()
    {
        Dictionary<string, string> parameters = Sliders.GetParametersFromSlidersAndChoices();
        Build(parameters);
    }

    public void Build(Dictionary<string, string> parameters)
    {
        LoadingScreen.SetActive(true);
        for (int i = 0; i < ParametersToAdd.Count; ++i)
        {
            if(!parameters.ContainsKey(ParametersToAdd[i]))
                parameters[ParametersToAdd[i]] = ParametersToAddValues[i];
        }
        
        ParametersToRemove.ForEach(p => parameters.Remove(p));

        IsMale = Mathf.RoundToInt(float.Parse(parameters[GenderParameterName], NumberStyles.Any, CultureInfo.InvariantCulture)) == 1; 
        LogParameters(parameters);
        StartCoroutine(ApplyAndDownloadInternal(parameters));
    }

    IEnumerator ApplyAndDownloadInternal(Dictionary<string, string> parameters)
    {
        bool disableLoadingScreen = false;
        for (int i = 0; i < 3; ++i)
        {
            bool retry = false;
            try
            {
                Client.DoApplyModifiersAndExportFBX(parameters, (base64Fbx) =>
                {
                    OnFbxGot(base64Fbx);
                    Client.DoUploadFbx(base64Fbx, () => { Debug.Log("Avatar uploaded on bucket"); });
                    Client.DoUploadParameters(parameters, () => { Debug.Log("Parameters uploaded on bucket"); });
                    retry = false;
                });
            }
            catch (Exception e)
            {
                if(i == 2)
                    disableLoadingScreen = true;
                retry = true;
            }
            if(retry)
            {
                yield return new WaitForSeconds(ApplyAndDownloadRetryDelay);
            }
            else
            {
                break;
            }
        }
        if(disableLoadingScreen)
        {
            LoadingScreen.SetActive(false);
        }
    }

    public void Download()
    {
        byte[] binaryFbx = Convert.FromBase64String(lastAvatarBase64);
        DownloadFileBrowser(binaryFbx, binaryFbx.Length, Client.FbxFileName);
    }
}
