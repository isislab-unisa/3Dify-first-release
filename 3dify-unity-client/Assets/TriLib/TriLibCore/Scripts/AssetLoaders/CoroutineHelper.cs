using System.Collections;
using UnityEngine;

namespace TriLibCore
{
    /// <summary>
    /// Represents a class used to dispatch coroutines.
    /// </summary>
    public class CoroutineHelper : MonoBehaviour
    {
        private static CoroutineHelper _instance;

        /// <summary>
        /// Gets the coroutine helper instance.
        /// </summary>
        public static CoroutineHelper Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new GameObject("Coroutine Helper").AddComponent<CoroutineHelper>();
                    _instance.hideFlags = HideFlags.DontSave;
                }
                return _instance;
            }
        }

        public static void RunMethod(IEnumerator enuemrator)
        {
            while (enuemrator.MoveNext())
            {

            }
        }
    }
}