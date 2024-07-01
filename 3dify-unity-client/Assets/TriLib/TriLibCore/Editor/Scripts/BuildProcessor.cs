using System;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace TriLibCore.Editor
{
    public class BuildProcessor : IPreprocessBuildWithReport
    {
        public int callbackOrder => -1000;

        public void OnPreprocessBuild(BuildReport report)
        {
#if TRILIB_ENABLE_WEBGL_THREADS
            PlayerSettings.WebGL.threadsSupport = true;
#else
            PlayerSettings.WebGL.threadsSupport = false;
#endif
#if UNITY_WSA
            if (!Application.isBatchMode && !PlayerSettings.WSA.GetCapability(PlayerSettings.WSACapability.RemovableStorage) && EditorUtility.DisplayDialog(
                    "TriLib", "TriLib cache system needs the [RemovableStorage] WSA Capacity enabled. Do you want to enable it?", "Yes", "No"))
            {
                PlayerSettings.WSA.SetCapability(PlayerSettings.WSACapability.RemovableStorage, true);
            }
#endif
            var waitingMappers = false;
            string materialMapper = null;
            var arguments = Environment.GetCommandLineArgs();
            for (var i = 0; i < arguments.Length; i++)
            {
                var argument = arguments[i];
                if (waitingMappers)
                {
                    materialMapper = argument;
                    continue;
                }

                switch (argument)
                {
                    case "-trilib_mappers":
                        {
                            waitingMappers = true;
                            break;
                        }
                }
            }

            if (materialMapper is object)
            {
                Debug.Log($"Using the given material mapper:{materialMapper}.");
                CheckMappers.SelectMapper(materialMapper);
            }
            else
            {
                CheckMappers.Initialize();
            }
        }
    }
}