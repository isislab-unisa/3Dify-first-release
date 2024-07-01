using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using TriLibCore;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

public class PreviewManager : MonoBehaviour
{
    public Client3dify Client;
    public SlidersManager Sliders;
    public AssetLoaderOptions Options;    
    public Vector3 StartPos;
    public Vector3 StartRot;
    public Image InputImage;
    public List<string> MaterialsToMakeFade;
    public RuntimeAnimatorController AnimatorController;
    public List<string> ParametersToAdd;
    public List<string> ParametersToAddValues;
    public List<string> ParametersToRemove;
    private GameObject avatar;
    private string lastAvatarBase64;
    
    // To be called from js
    public void Init(string endpoint, string bucketName)
    {
        avatar = null;
        Client.ServerEndpoint = endpoint;
        Client.BucketName = bucketName;
        Client.DoGetImage(tex =>
        {
            Sprite image = Sprite.Create(tex, new Rect(0f, 0f, tex.width, tex.height), new Vector2(0.5f, 0.5f), 100f);
            InputImage.sprite = image;
            string base64Image = Convert.ToBase64String(tex.EncodeToJPG());
            Client.DoExtractGenderAndAge(base64Image, tex.width, genderAndAge =>
            {
                Client.DoExtractParameters(base64Image, genderAndAge.message.gender, genderAndAge.message.age, par =>
                {
                    Sliders.ApplyParametersToSlidersAndChoices(par);
                    Build();
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
        avatar.transform.position = StartPos;
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
        animator.runtimeAnimatorController = AnimatorController;
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

    public void Build()
    {
        Dictionary<string, string> parameters = Sliders.GetParametersFromSlidersAndChoices();
        for (int i = 0; i < ParametersToAdd.Count; ++i)
        {
            parameters[ParametersToAdd[i]] = ParametersToAddValues[i];
        }
        
        ParametersToRemove.ForEach(p => parameters.Remove(p));
        
        LogParameters(parameters);
        Client.DoApplyModifiers(parameters, () =>
        {
            Client.ExportFbxFromMakehuman((base64Fbx) =>
            {
                OnFbxGot(base64Fbx);
                Client.DoUploadFbx(base64Fbx, () =>
                {
                    Debug.Log("Avatar uploaded on bucket");
                });
                
                Client.DoUploadParameters(parameters, () =>
                {
                    Debug.Log("Parameters uploaded on bucket");
                });
            });
        });
    }

    public void Download()
    {
        byte[] binaryFbx = Convert.FromBase64String(lastAvatarBase64);
        // TODO download fbx from browser
    }
}
